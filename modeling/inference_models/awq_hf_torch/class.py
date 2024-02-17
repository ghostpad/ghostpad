from __future__ import annotations

try:
    import os
    import torch
    from typing import Dict

    import utils
    import modeling.lazy_loader as lazy_loader
    import koboldai_settings
    from logger import logger, set_logger_verbosity

    from modeling.inference_models.hf_torch import HFTorchInferenceModel
    from modeling.tokenizer import GenericTokenizer

    from pathlib import Path

    from awq import AutoAWQForCausalLM
    load_failed = False
except:
    load_failed = True

model_backend_type = "AWQ"
model_backend_name = "AutoAWQ"

def get_awq_file(path):
    safetensors_file = os.path.join(path, "model.safetensors")
    pt_file = os.path.join(path, "model.ckpt")
    if (os.path.isfile(safetensors_file)):
        return safetensors_file
    elif (os.path.isfile(pt_file)):
        return pt_file
    else:
        return ""

class model_backend(HFTorchInferenceModel):
    def __init__(self) -> None:
        super().__init__()
        self.fuse_layers = False
        self.disable = load_failed

    def is_valid(self, model_name, model_path, menu_path):
        return super().is_valid(model_name, model_path, menu_path) and not self.disable

    def _load(self, save_model: bool, initial_load: bool) -> None:
        from transformers import AutoModelForCausalLM

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
            from huggingface_hub import snapshot_download
            target_dir = "models/" + self.model_name.replace("/", "_")
            snapshot_download(self.model_name, local_dir=target_dir, local_dir_use_symlinks=False, cache_dir="cache/", revision=utils.koboldai_vars.revision)

        self.model = self._get_model(self.get_local_model_path())
        self.tokenizer = self._get_tokenizer(self.get_local_model_path())
        self.tokenizer.add_bos_token = False

        if (
            utils.koboldai_vars.badwordsids is koboldai_settings.badwordsids_default
            and utils.koboldai_vars.model_type not in ("gpt2", "gpt_neo", "gptj")
        ):
            utils.koboldai_vars.badwordsids = [
                [v]
                for k, v in self.tokenizer.get_vocab().items()
                if any(c in str(k) for c in "[]")
            ]

        self.model.kai_model = self
        utils.koboldai_vars.modeldim = self.get_hidden_size()

    def _get_model(self, location: str):
        from transformers import AutoModelForCausalLM

        awq_file = get_awq_file(location)

        logger.info(f"Using AWQ file: {awq_file}")

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
            model = AutoAWQForCausalLM.from_quantized(location, os.path.basename(awq_file), safetensors=True, fuse_layers=self.fuse_layers)
            model.config = model.model.config

            # Patch in embeddings function
            def get_input_embeddings(self):
                return self.model.get_input_embeddings()

            type(model).get_input_embeddings = get_input_embeddings

            # Patch in args support..
            def generate(self, *args, **kwargs):
                """shortcut for model.generate"""
                with torch.inference_mode():
                    return self.model.generate(max_new_tokens=None, *args, **kwargs)

            type(model).generate = generate

        return model

    def set_input_parameters(self, parameters):
        super().set_input_parameters(parameters)
        self.fuse_layers = parameters.get("fuse_layers", False)

    def get_requested_parameters(self, model_name, model_path, menu_path, parameters = {}):
        requested_parameters = super().get_requested_parameters(model_name, model_path, menu_path, parameters)
        requested_parameters.append({
            "uitype": "toggle",
            "unit": "bool",
            "label": "Fuse Layers",
            "id": "fuse_layers",
            "min": 0,
            "max": 1,
            "step": 1,
            "default": 0,
            "tooltip": "Greatly increases speed but may be less stable.",
            "menu_path": "Configuration",
            "extra_classes": "",
            "refresh_model_inputs": False
        })
        return requested_parameters

    def _get_tokenizer(self, location: str):
        from transformers import AutoTokenizer, LlamaTokenizer

        model_type = self.get_model_type()
        if model_type == "llama":
            tokenizer = LlamaTokenizer.from_pretrained(location)
        else:
            tokenizer = AutoTokenizer.from_pretrained(location)

        return GenericTokenizer(tokenizer)
