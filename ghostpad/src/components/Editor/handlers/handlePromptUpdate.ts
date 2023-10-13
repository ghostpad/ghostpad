import {
  ConfigState,
  KoboldConfigTimestamps,
  updateOwnActions,
} from "@/store/configSlice";
import { store } from "@/store/store";
import { clearStreamTokens } from "@/store/uiSlice";
import { KoboldConfig } from "@/types/KoboldConfig";
import generateNodesFromText from "@/util/generateNodesFromText";
import { $nodesOfType, LexicalEditor } from "lexical";
import { ActionNode } from "../ActionNode";
import { $getStory } from "../StoryNode";

export const handlePromptUpdate = (
  config: Partial<KoboldConfig>,
  timestamps: KoboldConfigTimestamps,
  editor: LexicalEditor
) => {
  const promptText = config.story?.prompt_wi_highlighted_text?.[0].text || "";
  const nodes = generateNodesFromText(promptText);

  // See handleActionUpdate for an explanation of why ownActions is used.
  const { ownActions }: ConfigState = store.getState().config;
  const ownActionIndex = ownActions.findIndex(
    (ownAction) =>
      ownAction.id === undefined &&
      ownAction.text === promptText &&
      ownAction.timestamp > (timestamps.story?.actions?.[0] || 0)
  );

  if (ownActionIndex > -1) {
    const updatedOwnActions = [...ownActions];
    updatedOwnActions.splice(ownActionIndex, 1);
    store.dispatch(updateOwnActions(updatedOwnActions));
    return;
  }

  const storyNode = $getStory();
  const promptNode = $nodesOfType(ActionNode).filter((node) =>
    storyNode.isParentOf(node)
  )[0];

  if (promptNode instanceof ActionNode) {
    if (promptText !== promptNode?.getLatest().getTextContent()) {
      promptNode.clear();
      store.dispatch(clearStreamTokens());
      promptNode.append(...nodes);
      editor.getElementByKey(promptNode.getKey())?.scrollIntoView();
    }
  }
};
