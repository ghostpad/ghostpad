import { store } from "@/store/store";
import { clearStreamTokens } from "@/store/uiSlice";
import { KoboldConfig } from "@/types/KoboldConfig";
import generateNodesFromText from "@/util/generateNodesFromText";
import { $nodesOfType, LexicalEditor } from "lexical";
import { ActionNode } from "../ActionNode";
import { $getStory } from "../StoryNode";

export const handlePromptUpdate = (
  config: Partial<KoboldConfig>,
  editor: LexicalEditor
) => {
  const promptText = config.story?.prompt_wi_highlighted_text?.[0].text || "";
  const nodes = generateNodesFromText(promptText);

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
