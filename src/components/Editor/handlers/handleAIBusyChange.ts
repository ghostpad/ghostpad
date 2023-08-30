import { ReinsertQueue, updateReinsertQueue, updateReinsertHistory } from "@/store/configSlice";
import { openModal, clearStreamTokens } from "@/store/uiSlice";
import { KoboldConfig } from "@/types/KoboldConfig";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { LexicalEditor, $nodesOfType, TextNode } from "lexical";
import { ActionNode } from "../ActionNode";
import { Dispatch } from "@reduxjs/toolkit";
import { appendNewActionNode } from "@/util/appendNewActionNode";

export const handleAiBusyChange = (
  action: { payload: MsgVarChanged },
  config: Partial<KoboldConfig>,
  reinsertQueue: ReinsertQueue,
  editor: LexicalEditor,
  dispatch: Dispatch
) => {
  const isMultiGen =
    typeof config.model?.numseqs === "number" && config.model.numseqs > 1;

  if (action.payload.value === true) {
    // We just started generating. If we're in multi-gen mode, open the modal containing the options.
    if (isMultiGen) {
      const contentfulActions = config.story?.actions.filter(
        (action) => action.action["Selected Text"].length > 0
      );
      const lastContentfulAction =
        contentfulActions?.[contentfulActions.length - 1];
      dispatch(
        openModal({
          name: "selectOption",
          data: {
            actionId: lastContentfulAction ? lastContentfulAction.id + 1 : 0,
          },
        })
      );
    }
    editor.setEditable(false);
  } else {
    // Just stopped generating.
    editor.setEditable(true);
    dispatch(clearStreamTokens());
    // We need to handle cases where it's generating in the middle of the story,
    // and the part after the cursor has been temporarily removed, and we need to re-insert it.
    if (reinsertQueue.length) {
      const contentfulNodes = $nodesOfType(ActionNode).filter(
        (node) => node.getTextContentSize() > 0
      );
      // Sometimes, the AI generates nothing, therefore the last action can be one of two things:
      // - The action containing the text we wanted to generate
      // - The last action before our continuation point, if nothing was generated
      // We can determine which case this is by checking the action ID that's stored key in the reinsert queue.
      const lastAction = contentfulNodes.pop();
      const lastActionId = lastAction?.getActionId();
      const lastReinsertId = reinsertQueue[reinsertQueue.length - 1].key;
      if (
        typeof lastActionId === "number" &&
        lastActionId > (lastReinsertId || 0)
      ) {
        // lastAction is a new action, add it to the prior node
        const lastActionText = lastAction?.getTextContent() || "";
        lastAction?.clear();
        const prevSibling = contentfulNodes.pop();
        prevSibling?.append(new TextNode(lastActionText));
      }
      reinsertQueue.forEach((queueItem) => {
        // Add the queued up text back to the story.
        const existingTargetNode = $nodesOfType(ActionNode).find(
          (node) => node.getActionId() === queueItem.key
        );
        if (!existingTargetNode) {
          appendNewActionNode(queueItem.key, queueItem.text);
        } else {
          const textNode = new TextNode(queueItem.text);
          existingTargetNode.append(textNode);
        }
      });
      dispatch(updateReinsertQueue([]));
    } else {
      dispatch(updateReinsertHistory(null));
    }
  }
};