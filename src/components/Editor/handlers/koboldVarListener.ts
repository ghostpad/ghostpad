import {
  ConfigState,
} from "@/store/configSlice";
import { store } from "@/store/store";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { Dispatch } from "@reduxjs/toolkit";
import { LexicalEditor } from "lexical";
import { handleAiBusyChange } from "./handleAIBusyChange";
import { handleActionUpdate } from "./handleActionUpdate";
import { handlePromptUpdate } from "./handlePromptUpdate";

export const koboldVarListener = (
  editor: LexicalEditor,
  action: { payload: MsgVarChanged },
  dispatch: Dispatch
) => {
  const {
    koboldConfig: config,
    reinsertQueue,
    timestamps,
  }: ConfigState = store.getState().config;

  const isActionUpdate =
    action.payload.classname === "story" && action.payload.name === "actions";

  const isPromptUpdate =
    action.payload.classname === "story" &&
    action.payload.name === "prompt_wi_highlighted_text";

  const isAiBusyChange =
    action.payload.classname === "system" && action.payload.name === "aibusy";
  if (isAiBusyChange) {
    handleAiBusyChange(action, config, reinsertQueue, editor, dispatch);
  }

  // The server will send two messages for the same prompt update.
  // One contains the old value, and the later message has the old value always set to null.
  // I haven't looked into why this is, but I only need the latest message and don't need the old value.
  if (isPromptUpdate && action.payload.old_value !== null) {
    return;
  }

  if (isActionUpdate) {
    handleActionUpdate(action, editor);
  } else if (isPromptUpdate) {
    handlePromptUpdate(config, timestamps, editor);
  }
};
