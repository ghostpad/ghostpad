import { $nodesOfType } from "lexical";
import { ActionNode } from "../ActionNode";
import { updateReinsertHistory } from "@/store/configSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const resetStoryListener = (dispatch: Dispatch) => {
  $nodesOfType(ActionNode).forEach((action, idx) => {
    // If the current story is reloaded and the prompt is unchanged, no prompt will be sent from the backend on load.
    // So we need to keep the prompt intact unless it is explicitly changed.
    if (idx !== 0) {
      action.remove();
    }
  });
  dispatch(updateReinsertHistory(null));
};