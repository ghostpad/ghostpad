import * as R from "ramda";
import { store } from "@/store/store";
import { Action } from "@/types/Action";
import { MsgVarChanged } from "@/types/MsgVarChanged";
import { $nodesOfType, LexicalEditor, TextNode } from "lexical";
import { ActionNode } from "../ActionNode";
import { $isStoryNode } from "../StoryNode";
import { appendNewActionNode } from "@/util/appendNewActionNode";
import generateNodesFromText from "@/util/generateNodesFromText";
import { clearStreamTokens } from "@/store/uiSlice";

export const handleActionUpdate = (
  action: { payload: MsgVarChanged },
  editor: LexicalEditor
) => {
  const actionPayload = action.payload.value as Action | Action[];
  const isActionArray = Array.isArray(actionPayload);
  const actionArray = isActionArray ? actionPayload : [actionPayload];

  actionArray.forEach((koboldAction: Action) => {
    // In KoboldAI, when you modify an action, you receive it back without any sort of ID identifying the source.
    // This works fine when you only update on blur like they do, but in our case, it's chaos while you're quickly typing.
    // The forked backend will probably address this at some point, but for now,
    // we need to macgyver a way to ignore the action we just sent.

    const actionId = Number(koboldAction.id);
    const actionText = koboldAction.action?.["Selected Text"] || "";
    const existingNode = $nodesOfType(ActionNode).find((action) => {
      const isStoryChild = $isStoryNode(action.getParent());
      const isMatchingId = action.getActionId() === actionId;
      return isStoryChild && isMatchingId;
    });

    if (!actionText) {
      // We received an empty action, which means it was deleted.
      if (existingNode) {
        existingNode.remove();
      }
      return;
    }

    const existingContent = existingNode?.getLatest().getTextContent();
    if (actionText === existingContent) return;

    const actionNode =
      existingNode || appendNewActionNode(actionId, actionText);

    const nodes = generateNodesFromText(actionText);
    const existingChildren = actionNode.getChildren();
    if (existingChildren?.length > nodes.length) {
      for (let i = 0; i < existingChildren.length - nodes.length; i++) {
        existingChildren[nodes.length + i].remove();
      }
    }

    store.dispatch(clearStreamTokens());

    nodes.forEach((node, idx) => {
      if (!existingChildren[idx]) {
        actionNode.append(node);
        editor.getElementByKey(node.getKey())?.scrollIntoView();
      } else if (existingChildren[idx].getType() !== node.getType()) {
        existingChildren[idx].replace(node);
        editor.getElementByKey(node.getKey())?.scrollIntoView();
      } else if (
        existingChildren[idx].getTextContent() !== node.getTextContent()
      ) {
        (existingChildren[idx] as TextNode).setTextContent(
          node.getTextContent()
        );
        editor
          .getElementByKey(existingChildren[idx].getKey())
          ?.scrollIntoView();
      }
    });
  });

  const actionNodes = $nodesOfType(ActionNode).filter((action) =>
    $isStoryNode(action.getParent())
  );

  if (isActionArray && actionNodes.length > actionArray.length + 1) {
    R.range(actionArray.length + 1, actionNodes.length).forEach((idx) => {
      actionNodes[idx].remove();
    });
  }
};
