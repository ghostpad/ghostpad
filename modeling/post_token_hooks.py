import torch

import utils
from modeling.inference_model import InferenceModel


class PostTokenHooks:
    @staticmethod
    def stream_tokens(
        model: InferenceModel,
        input_ids: torch.LongTensor,
    ) -> None:
        if not model.gen_state.get("do_streaming"):
            return

        if not utils.koboldai_vars.output_streaming:
            return

        data = [
            utils.applyoutputformatting(
                utils.decodenewlines(model.tokenizer.decode(x[-1])),
                no_sentence_trimming=True,
                no_single_line=True,
            )
            for x in input_ids
        ]
        utils.koboldai_vars.actions.stream_tokens(data)

    @staticmethod
    def stream_token_sequence(
        model: InferenceModel,
        input_ids: torch.LongTensor,
    ) -> None:
        # stream_tokens decodes the last token in the sequence, but we want to
        # decode the entire sequence. this way, we don't need to worry about
        # the whitespace issues that require monkey patching in model classes.
        if not model.gen_state.get("do_streaming"):
            return

        if not utils.koboldai_vars.output_streaming:
            return

        data = [
            utils.applyoutputformatting(
                utils.decodenewlines(model.tokenizer.decode(x)),
                no_sentence_trimming=True,
                no_single_line=True,
            )
            for x in input_ids
        ]
        # This only supports batch size 1 currently
        new_data = ''.join(data)[model.current_token_pos:]
        model.current_token_pos += len(new_data)

        utils.koboldai_vars.actions.stream_tokens([new_data])
