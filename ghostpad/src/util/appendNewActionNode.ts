import { ActionNode } from "@/components/Editor/ActionNode";
import { $getStory } from "@/components/Editor/StoryNode";
import { TextNode, $nodesOfType } from "lexical";

export const appendNewActionNode = (
  actionId: number | undefined,
  actionText: string
) => {
  const newActionNode = new ActionNode(undefined, actionId);
  newActionNode.append(new TextNode(actionText));
  const targetNode =
    $nodesOfType(ActionNode)
      .filter((node) => (node.getActionId() ?? 0) < (actionId ?? 0))
      .pop() || $getStory().getFirstChild();
  targetNode?.insertAfter(newActionNode);

  return newActionNode;
};