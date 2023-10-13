import {
  $getRoot,
  $nodesOfType,
} from "lexical";
import { $isActionNode, ActionNode } from "../ActionNode";
import { $getStory } from "../StoryNode";
import { $isTempReinsertNode } from "../TempReinsertNode";
import { $isTempStreamNode } from "../TempStreamNode";

export const storyMutationListener = () => {
  const actionNodes = $nodesOfType(ActionNode);
  const nodesWithText = actionNodes.filter(
    (node) => node.getTextContentSize() > 0
  );

  const firstAction = nodesWithText[0] || actionNodes[0];
  // When nodes end up outside of an action, find an action to put them in.
  const orphanNodes = $getStory()
    .getChildren()
    .filter((node) => !$isActionNode(node) && !$isTempReinsertNode(node) && !$isTempStreamNode(node));

  if (orphanNodes.length) {
    orphanNodes.forEach((node) => {
      const prevAction = node
        .getPreviousSiblings()
        .filter(
          (sibling) =>
            sibling.getType() === "action" &&
            (sibling.getTextContentSize() ||
              (sibling.getIndexWithinParent() === 0 && !$getRoot().getTextContentSize()))
        )[0];
      const nextAction = node
        .getNextSiblings()
        .filter(
          (sibling) =>
            sibling.getType() === "action" &&
            (sibling.getTextContentSize() ||
              (sibling.getIndexWithinParent() === 0 && !$getRoot().getTextContentSize()))
        )[0];
      const isBefore =
        node.getIndexWithinParent() <
        (firstAction?.getIndexWithinParent() || 0);
      const targetNode = isBefore ? nextAction : (prevAction as ActionNode);

      targetNode?.splice(isBefore ? 0 : targetNode.getChildrenSize(), 0, [
        node,
      ]);
    });
  }
};
