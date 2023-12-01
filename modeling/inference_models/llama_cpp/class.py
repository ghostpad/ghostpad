from __future__ import annotations

try:
    import os
    import numpy as np
    import torch
    from typing import Dict, List, Union

    from logger import logger

    from modeling.inference_model import (
        InferenceModel,
        GenerationResult,
        GenerationSettings,
    )
    from modeling.post_token_hooks import PostTokenHooks
    from modeling.stoppers import Stoppers

    from transformers import (
        LlamaTokenizer,
    )

    from llama_cpp import Llama

    import utils

    load_failed = False
except:
    load_failed = True

model_backend_type = "LlamaCPP"
model_backend_name = "Llama.cpp"


class model_backend(InferenceModel):
    def __init__(self) -> None:
        super().__init__()
        self.disable = load_failed
        self.model_name = None
        self.model_file = None
        self.path = None
        self.post_token_hooks = [
            PostTokenHooks.stream_token_sequence,
        ]
        self.stopper_hooks = [
            Stoppers.core_stopper,
            Stoppers.dynamic_wi_scanner,
            Stoppers.singleline_stopper,
            Stoppers.chat_mode_stopper,
            Stoppers.stop_sequence_stopper,
        ]
        # Used to stream tokens without weird monkey patching tricks
        self.current_token_pos = 0

    def _load(self, save_model: bool, initial_load: bool) -> None:
        self.model = self._get_model(self._get_local_model_path())
        print("Llama.cpp model loaded", self.model_file)
        self.tokenizer = self._get_tokenizer()
        self.tokenizer.add_bos_token = False

    def _get_tokenizer(self):
        std_kwargs = {"revision": utils.koboldai_vars.revision, "cache_dir": "cache"}
        return LlamaTokenizer.from_pretrained(
            "KoboldAI/llama2-tokenizer", use_fast=False, **std_kwargs
        )

    def _get_model_files(self, location: str):
        model_files = []
        for file in os.listdir(location):
            if file.endswith(".bin") or file.endswith(".gguf"):
                model_files.append(
                    {"text": file, "value": os.path.join(location, file)}
                )
        if len(model_files) and self.model_file is None:
            self.model_file = model_files[0]["value"]
        return model_files

    def _get_local_model_path(self):
        if self.path is not None and os.path.exists(self.path):
            return self.path
        else:
            return None

    def _get_model(self, location: str):
        logger.info(f"Using model file: {self.model_file}")

        model = Llama(
            model_path=self.model_file,
            n_ctx=utils.koboldai_vars.max_length,
            n_batch=utils.koboldai_vars.max_length,
        )

        return model

    def _stopper(self, input_ids, logits) -> bool:
        tensor_input_ids = torch.from_numpy(np.expand_dims(input_ids, axis=0))
        do_stop = False
        for stopper in self.stopper_hooks:
            do_stop = stopper(self, tensor_input_ids)
            if do_stop:
                break
        return do_stop

    def _raw_generate(
        self,
        prompt_tokens: [List[int], torch.Tensor],
        max_new: int,
        gen_settings: GenerationSettings,
        single_line: bool = False,
        # Multi output currently unsupported - https://github.com/ggerganov/llama.cpp/issues/2789
        batch_count: int = 1,
        **kwargs,
    ) -> GenerationResult:
        self.current_token_pos = 0
        decoded_prompt = utils.decodenewlines(self.tokenizer.decode(prompt_tokens))

        utils.koboldai_vars.lastctx = decoded_prompt
        stream = self.model(
            decoded_prompt,
            max_tokens=utils.koboldai_vars.genamt,
            stopping_criteria=self._stopper,
            stream=True,
            temperature=gen_settings.temp,
            # Llama.cpp does not use a rep pen range or slope
            repeat_penalty=gen_settings.rep_pen,
            # todo need to use lower level api to allow configurable sampler order
            tfs_z=gen_settings.tfs,
            top_k=gen_settings.top_k,
            top_p=gen_settings.top_p,
            typical_p=gen_settings.typical,
        )

        outputs = []
        for output in stream:
            for idx, out in enumerate(output["choices"]):
                while len(outputs) <= idx:
                    outputs.append("")
                outputs[idx] += out["text"]
            tokens = [self.tokenizer.encode(choice) for choice in outputs]
            if (self._stopper(tokens[0], None)):
                break
            self._post_token_gen(tokens)

        # outputs = [out["text"] for out in stream["choices"]]
        return GenerationResult(
            model=self,
            out_batches=np.array(tokens),
            prompt=prompt_tokens,
            is_whole_generation=False,
            single_line=single_line,
        )

    def is_valid(self, model_name, model_path, menu_path):
        # Scan the model path for .bin or .gguf files
        return len(self._get_model_files(model_path)) > 0

    def set_input_parameters(self, parameters):
        super().set_input_parameters(parameters)
        self.model_name = (
            parameters["custom_model_name"]
            if "custom_model_name" in parameters
            else parameters["id"]
        )
        self.path = parameters["path"] if "path" in parameters else None
        if "model_file" in parameters and parameters["model_file"] is not None:
            self.model_file = parameters["model_file"]

    def get_requested_parameters(
        self, model_name, model_path, menu_path, parameters={}
    ):
        requested_parameters = []
        model_files = self._get_model_files(model_path)
        requested_parameters.append(
            {
                "uitype": "dropdown",
                "unit": "text",
                "label": "Model file",
                "id": "model_file",
                "default": model_files[0]["value"] if len(model_files) else None,
                "tooltip": "The model file to use for generation",
                "menu_path": "Layers",
                "extra_classes": "",
                "refresh_model_inputs": False,
                "children": model_files,
            }
        )
        return requested_parameters