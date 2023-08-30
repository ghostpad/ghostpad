import { ReinsertQueue, updatePendingInsertion, updateReinsertHistory, updateReinsertQueue } from "@/store/configSlice";
import { $getSelection, $isRangeSelection, $nodesOfType, TextNode } from "lexical";
import { $isActionNode, ActionNode } from "../ActionNode";
import { Dispatch } from "@reduxjs/toolkit";

export const pendingInsertionListener = (
  action: { payload: boolean; type: string },
  dispatch: Dispatch
) => {
  if (action.payload === true) {
    dispatch(updatePendingInsertion(false));
    const selection = $getSelection();
    const lastAction = $nodesOfType(ActionNode)
      .filter((node) => node.getTextContentSize() > 0)
      .pop();
    const lastTextNode = lastAction?.getAllTextNodes().pop();
    if (lastTextNode && $isRangeSelection(selection)) {
      const removeRange = selection?.clone();
      const anchorNode = selection.anchor.getNode();
      removeRange.setTextNodeRange(
        anchorNode as TextNode,
        removeRange.anchor.offset,
        lastTextNode,
        lastTextNode.getTextContentSize()
      );

      const removeRangeNodes = removeRange.getNodes();
      const removeRangeTextNodes = removeRangeNodes.filter(
        (node) => node.getType() === "text"
      );
      const firstTextNodeIdx = removeRangeNodes.findIndex(
        (node) => node.getType() === "text"
      );
      const leadingLineBreaks = removeRangeNodes
        .slice(0, firstTextNodeIdx)
        .filter((node) => node.getType() === "linebreak");

      const firstNodeRange = selection?.clone();
      const lastTextNodeFromFirstAction = anchorNode
        .getTopLevelElement()
        ?.getAllTextNodes()
        .pop() as TextNode;
      const nodesAfterText = lastTextNodeFromFirstAction.getNextSiblings();
      firstNodeRange.setTextNodeRange(
        anchorNode as TextNode,
        firstNodeRange.anchor.offset,
        lastTextNodeFromFirstAction,
        lastTextNodeFromFirstAction?.getTextContentSize() || 0
      );

      const firstNodeText =
        firstNodeRange.getTextContent() +
        nodesAfterText.map((node) => node.getTextContent()).join("");

      const reinsertQueue = removeRange
        .getNodes()
        .reduce((queue: ReinsertQueue, node, idx) => {
          const nodeAction = node.getTopLevelElement();

          if (nodeAction?.getType() === "action") {
            if (
              queue.some(
                (item) => item.key === (nodeAction as ActionNode).getActionId()
              )
            ) {
              return queue;
            }
            return [
              ...queue,
              {
                key: (nodeAction as ActionNode).getActionId(),
                text: idx === 0 ? firstNodeText : nodeAction.getTextContent(),
              },
            ];
          }
          return queue;
        }, []);

      dispatch(
        updateReinsertHistory({
          reinsertQueue,
          anchor: {
            parentIdx: anchorNode.getParent()?.getIndexWithinParent() || 0,
            nodeIdx: anchorNode.getIndexWithinParent(),
            offset: removeRange.anchor.offset,
            isAction: $isActionNode(anchorNode),
          },
        })
      );

      if (leadingLineBreaks.length > 0) {
        // removeRange.removeText will break if the first node is a linebreak, so we remove them first
        leadingLineBreaks.forEach((lineBreak) => {
          lineBreak.remove();
        });

        if (removeRangeTextNodes.length > 0) {
          removeRange.setTextNodeRange(
            removeRangeTextNodes[0] as TextNode,
            0,
            lastTextNode,
            lastTextNode.getTextContentSize()
          );
        }
      }

      removeRange.removeText();
      dispatch(updateReinsertQueue(reinsertQueue));
    }
  }
};