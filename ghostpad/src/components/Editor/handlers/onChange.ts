import {
  ConfigState,
  setNodeCount,
  updateOwnActions,
} from "@/store/configSlice";
import { store } from "@/store/store";
import { $getSelection, $nodesOfType, EditorState } from "lexical";
import { ActionNode } from "../ActionNode";
import { $isStoryNode } from "../StoryNode";
import { SocketApi } from "@/socketApi/SocketApiProvider";

const onChange = (socketApi: SocketApi) => (editorState: EditorState) => {
  const {
    koboldConfig: config,
    lastNodeCount,
    loadState,
  }: ConfigState = store.getState().config;
  if (config.system?.aibusy) return;
  const actions = config.story?.actions || [];
  const contentfulActions = actions.filter(
    (action) => action?.action["Selected Text"].length
  );
  const promptText = config.story?.prompt_wi_highlighted_text?.[0]?.text || "";
  editorState.read(() => {
    const selection = $getSelection();
    const actionNodes = $nodesOfType(ActionNode).filter((action) =>
      $isStoryNode(action.getParent())
    );

    // The structure is: Root Node -> Story Node (Shadow Root) -> Action Node -> Text Node
    // selection.getNodes() will return nodes at the text level.
    // Since the story is a shadow root, its children (action nodes) will be returned in `getTopLevelElement()`
    const cursorActionIdx =
      selection?.getNodes()[0].getTopLevelElement()?.getIndexWithinParent() ||
      0;
    const startActionIdx = Math.max(cursorActionIdx, 0);

    // Starting at `start`, check backward then forward for changes
    // If we don't find a change, we break out of the loop
    if (typeof startActionIdx !== "undefined") {
      [-1, 1].forEach((step) => {
        for (
          let i = startActionIdx;
          i < Math.max(lastNodeCount, actionNodes.length) && i >= 0;
          i += step
        ) {
          const isStart = i === startActionIdx;

          // We don't want to check the start action twice, so skip it on the backward pass
          if (step === -1 && isStart) continue;

          const node = actionNodes[i];
          const text = node?.getLatest()?.getTextContent() || "";

          if (i === 0) {
            // We just reloaded/cleared the story and haven't set the prompt yet, skip
            if (!loadState.prompt) continue;
            if (text !== promptText) {
              const { ownActions }: ConfigState = store.getState().config;
              store.dispatch(
                updateOwnActions([
                  ...ownActions,
                  { id: undefined, text: text, timestamp: Date.now() },
                ])
              );
              socketApi?.varChange("story_prompt", text);
            }
          } else {
            // We just reloaded/cleared the story and haven't set the actions array yet, skip
            if (!actions.length) continue;
            // Check actions for changes
            const actionId =
              contentfulActions[i - 1]?.id ?? node?.getActionId();
            const lastSyncedActionText =
              contentfulActions[i - 1]?.action?.["Selected Text"];
            // No change found, break out of the loop
            if (text.length && text === lastSyncedActionText && !isStart) break;
            if (
              typeof lastSyncedActionText !== "undefined" &&
              text !== lastSyncedActionText
            ) {
              // Change found, update the store and send the change to the server
              const { ownActions }: ConfigState = store.getState().config;
              store.dispatch(
                updateOwnActions([
                  ...ownActions,
                  { id: actionId, text: text, timestamp: Date.now() },
                ])
              );
              socketApi?.setSelectedText(actionId as number, text);
            }
          }
        }
      });
    }
    store.dispatch(setNodeCount(actionNodes.length));
  });
};

export default onChange;
