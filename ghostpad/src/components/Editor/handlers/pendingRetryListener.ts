import {
  ConfigState,
  updatePendingRetry,
  updateReinsertQueue,
} from "@/store/configSlice";
import { store } from "@/store/store";
import { Dispatch } from "@reduxjs/toolkit";
import {
  $createRangeSelection,
  $isLineBreakNode,
  $isTextNode,
  $nodesOfType,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import { $getStory } from "../StoryNode";
import { ActionNode } from "../ActionNode";
import { SocketApi } from "@/socketApi/SocketApiProvider";

export const pendingRetryListener = (
  editor: LexicalEditor,
  action: { payload: boolean; type: string },
  dispatch: Dispatch,
  socketApi: SocketApi
) => {
  if (action.payload === true) {
    editor.update(() => {
      dispatch(updatePendingRetry(false));
      const { reinsertHistory }: ConfigState = store.getState().config;
      if (reinsertHistory !== null) {
        const testSelection = $createRangeSelection();
        const anchorIsAction = reinsertHistory.anchor.isAction;
        const parentNode = anchorIsAction
          ? $getStory()
          : ($getStory().getChildAtIndex(
              reinsertHistory.anchor.parentIdx
            ) as ActionNode);
        const anchorNode = parentNode.getChildAtIndex(
          reinsertHistory.anchor.nodeIdx
        ) as LexicalNode;
        const anchorIsElement = !$isTextNode(anchorNode);
        const anchorKey = anchorNode.getKey();
        const anchorOffset = reinsertHistory.anchor.offset;
        testSelection?.anchor?.set(
          anchorKey,
          anchorOffset,
          anchorIsElement ? "element" : "text"
        );
        const lastTextNode = $nodesOfType(TextNode).pop();
        if (lastTextNode) {
          testSelection.focus.set(
            lastTextNode.getKey(),
            lastTextNode?.getTextContentSize(),
            $isLineBreakNode(lastTextNode) ? "element" : "text"
          );
        }
        testSelection.removeText();
        dispatch(updateReinsertQueue(reinsertHistory.reinsertQueue));
      } else {
        socketApi?.retry();
      }
    });
  }
};
