from __future__ import annotations

import os
import glob
import json
import torch
import re
from typing import Dict, Union

import utils
import modeling.lazy_loader as lazy_loader
import koboldai_settings
from logger import logger

from modeling.inference_models.hf_torch import HFTorchInferenceModel
from modeling.tokenizer import GenericTokenizer

from pathlib import Path


model_backend_type = "GPTQ"
model_backend_name = "AutoGPTQ"


def load_model_gptq_settings(path):
    try:
        js = json.load(open(path + "/config.json", "r"))
    except Exception as e:
        return False, -1, -1, False, -1

    gptq_model = False
    gptq_bits = -1
    gptq_groupsize = -1
    gptq_file = False
    gptq_version = -1

    gptq_legacy_files = glob.glob(os.path.join(path, "*4bit*.pt")) + glob.glob(os.path.join(path, "*4bit*.safetensors"))
    if "gptq_bits" in js:
        gptq_model = True
        gptq_bits = js["gptq_bits"]
        gptq_groupsize = js.get("gptq_groupsize", -1)
        safetensors_file = os.path.join(path, "model.safetensors")
        pt_file = os.path.join(path, "model.ckpt")
        gptq_file = safetensors_file if os.path.isfile(safetensors_file) else pt_file
        gptq_version = js.get("gptq_version", -1)
    elif gptq_legacy_files:
        gptq_model = True
        gptq_bits = 4
        gptq_file = gptq_legacy_files[0]
        fname = Path(gptq_file).parts[-1]
        g = re.findall("(?:4bit)(?:-)(\\d+)(?:g-?)", fname)
        gptq_groupsize = int(g[0]) if g else -1
        gptq_version = -1

    return gptq_model, gptq_bits, gptq_groupsize, gptq_file, gptq_version


def get_gptq_version(fpath):
    v1_strings = ["zeros", "scales", "bias", "qweight"]
    v2_strings = ["qzeros", "scales", "bias", "qweight"]
    v3_strings = ["qzeros", "scales", "g_idx", "qweight"]

    with open(fpath, "rb") as f:
        data = str(f.read(1024*1024))

    v0 = all([s in data for s in v1_strings]) and not "qzeros" in data
    v1 = all([s in data for s in v2_strings])
    v2 = all([s in data for s in v3_strings])

    if v2:
        if v0:
            logger.warning(f"GPTQ model identified as v2, but v0={v0}")
        return 2, v1
    if v1:
        if v0 or v2:
            logger.warning(f"GPTQ model identified as v1, but v0={v0} and v2={v2}")
        return 1, False
    if v0:
        if v1 or v2:
            logger.warning(f"GPTQ model identified as v0, but v1={v1} and v2={v2}")
        return 0, False

class model_backend(HFTorchInferenceModel):
    def is_valid(self, model_name, model_path, menu_path):
        gptq_model, _, _, _, _ = load_model_gptq_settings(model_path)
        return bool(gptq_model)

    def get_requested_parameters(self, model_name, model_path, menu_path, parameters = {}):
        requested_parameters = super().get_requested_parameters(model_name, model_path, menu_path, parameters)
        if model_name != 'customgptq' or "custom_model_name" in parameters:
            if os.path.exists("settings/{}.generic_hf_torch.model_backend.settings".format(model_name.replace("/", "_"))) and 'base_url' not in vars(self):
                with open("settings/{}.generic_hf_torch.model_backend.settings".format(model_name.replace("/", "_")), "r") as f:
                    temp = json.load(f)
            else:
                temp = {}
        return requested_parameters

    def set_input_parameters(self, parameters):
        super().set_input_parameters(parameters)

    def _load(self, save_model: bool, initial_load: bool) -> None:
        from transformers import AutoModelForCausalLM

        # Make model path the same as the model name to make this consistent
        # with the other loading method if it isn't a known model type. This
        # code is not just a workaround for below, it is also used to make the
        # behavior consistent with other loading methods - Henk717
        # if utils.koboldai_vars.model not in ["NeoCustom", "GPT2Custom"]:
        #     utils.koboldai_vars.custmodpth = utils.koboldai_vars.model

        self.init_model_config()

        self.lazy_load = True

        gpulayers = self.breakmodel_config.gpu_blocks

        try:
            self.gpu_layers_list = [int(l) for l in gpulayers.split(",")]
        except (ValueError, AttributeError):
            self.gpu_layers_list = [utils.num_layers(self.model_config)]

        # If we're using torch_lazy_loader, we need to get breakmodel config
        # early so that it knows where to load the individual model tensors
        logger.debug("lazy_load: {} hascuda: {} breakmodel: {} nobreakmode: {}".format(self.lazy_load, utils.koboldai_vars.hascuda, self.breakmodel, self.nobreakmodel))
        if (
            self.lazy_load
            and utils.koboldai_vars.hascuda
            and utils.koboldai_vars.breakmodel
            and not utils.koboldai_vars.nobreakmodel
        ):
            self.breakmodel_device_config(self.model_config)

        if self.lazy_load:
            # If we're using lazy loader, we need to figure out what the model's hidden layers are called
            with lazy_loader.use_lazy_load(dematerialized_modules=True):
                try:
                    metamodel = AutoModelForCausalLM.from_config(self.model_config)
                    utils.layers_module_names = utils.get_layers_module_names(metamodel)
                    utils.module_names = list(metamodel.state_dict().keys())
                    utils.named_buffers = list(metamodel.named_buffers(recurse=True))
                except Exception as e:
                    if utils.args.panic:
                        raise e
                    logger.warning(f"Gave up on lazy loading due to {e}")
                    self.lazy_load = False

        if not self.get_local_model_path():
            print(self.get_local_model_path())
            from huggingface_hub import snapshot_download
            target_dir = "models/" + self.model_name.replace("/", "_")
            print(self.model_name)
            snapshot_download(self.model_name, local_dir=target_dir, local_dir_use_symlinks=False, cache_dir="cache/", revision=utils.koboldai_vars.revision)
        
        self.model = self._get_model(self.get_local_model_path())
        self.tokenizer = self._get_tokenizer(self.get_local_model_path())

        if (
            utils.koboldai_vars.badwordsids is koboldai_settings.badwordsids_default
            and utils.koboldai_vars.model_type not in ("gpt2", "gpt_neo", "gptj")
        ):
            utils.koboldai_vars.badwordsids = [
                [v]
                for k, v in self.tokenizer.get_vocab().items()
                if any(c in str(k) for c in "[]")
            ]

        self.patch_embedding()

        self.model.kai_model = self
        utils.koboldai_vars.modeldim = self.get_hidden_size()

    def _patch_quant(self, device_map, quant_module) -> None:
        def make_quant(module, names, bits, groupsize, name='', force_bias=False, **kwargs):
            if isinstance(module, quant_module.QuantLinear):
                return

            for attr in dir(module):
                tmp = getattr(module, attr)
                name1 = name + '.' + attr if name != '' else attr
                if name1 in names:
                    parts = name1.split(".")
                    device = None
                    for i in reversed(range(len(parts))):
                        maybe_key = ".".join(parts[:i])
                        if maybe_key in device_map:
                            device = device_map[maybe_key]
                            break

                    if device is None:
                        raise ValueError(f"No device for {name1}")

                    delattr(module, attr)

                    ql = quant_module.QuantLinear(
                        bits,
                        groupsize,
                        tmp.in_features,
                        tmp.out_features,
                        force_bias or tmp.bias is not None,
                        **kwargs,
                    )
                    ql = ql.to(device)

                    setattr(module, attr, ql)

            for name1, child in module.named_children():
                make_quant(child, names, bits, groupsize, name + '.' + name1 if name != '' else name1, force_bias=force_bias)

        quant_module.make_quant = make_quant

    def _get_model(self, location: str):
        from transformers import AutoModelForCausalLM

        _, gptq_bits, gptq_groupsize, gptq_file, gptq_version = load_model_gptq_settings(location)
        v2_bias = False

        if gptq_version < 0:
            gptq_version, v2_bias = get_gptq_version(gptq_file)

        model_type = self.get_model_type()

        logger.info(f"Using GPTQ file: {gptq_file}, {gptq_bits}-bit model, type {model_type}, version {gptq_version}{' (with bias)' if v2_bias else ''}, groupsize {gptq_groupsize}")

        device_map = {}

        if self.lazy_load:
            with lazy_loader.use_lazy_load(dematerialized_modules=True):
                metamodel = AutoModelForCausalLM.from_config(self.model_config)
                if utils.args.cpu:
                    device_map = {name: "cpu" for name in utils.layers_module_names}
                    for name in utils.get_missing_module_names(
                        metamodel, list(device_map.keys())
                    ):
                        device_map[name] = "cpu"
                else:
                    device_map = self.breakmodel_config.get_device_map(
                        metamodel
                    )

        with lazy_loader.use_lazy_load(
            enable=self.lazy_load,
            dematerialized_modules=False,
        ):
            try:
                import auto_gptq
                from auto_gptq import AutoGPTQForCausalLM
            except ImportError:
                raise RuntimeError(f"4-bit load failed. Model type {model_type} not supported in 4-bit")

            autogptq_failed = False
            try:
                model = AutoGPTQForCausalLM.from_quantized(location, model_basename=Path(gptq_file).stem, use_safetensors=gptq_file.endswith(".safetensors"), device_map=device_map)
            except:
                autogptq_failed = True # Ugly hack to get it to free the VRAM of the last attempt like we do above, better suggestions welcome - Henk
            if autogptq_failed:
                model = AutoGPTQForCausalLM.from_quantized(location, model_basename=Path(gptq_file).stem, use_safetensors=gptq_file.endswith(".safetensors"), device_map=device_map, inject_fused_attention=False)
            # Patch in embeddings function
            def get_input_embeddings(self):
                return self.model.get_input_embeddings()

            type(model).get_input_embeddings = get_input_embeddings

            # Patch in args support..
            def generate(self, *args, **kwargs):
                """shortcut for model.generate"""
                with torch.inference_mode(), torch.amp.autocast(device_type=self.device.type):
                    return self.model.generate(*args, **kwargs)

            type(model).generate = generate

        return model

    def _get_tokenizer(self, location: str):
        from transformers import AutoTokenizer, LlamaTokenizer

        model_type = self.get_model_type()
        if model_type == "llama":
            tokenizer = LlamaTokenizer.from_pretrained(location)
        else:
            tokenizer = AutoTokenizer.from_pretrained(location)

        return GenericTokenizer(tokenizer)
