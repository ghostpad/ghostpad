import { ReinsertQueue } from "@/store/configSlice";
import { $nodesOfType, LexicalEditor } from "lexical";
import { $createTempReinsertNode, TempReinsertNode } from "../TempReinsertNode";
import generateNodesFromText from "@/util/generateNodesFromText";
import { $getStory } from "../StoryNode";
import { SocketApi } from "@/socketApi/SocketApiProvider";

export const reinsertQueueListener = (
  editor: LexicalEditor,
  action: { payload: ReinsertQueue; type: string },
  socketApi: SocketApi
) => {
  const reinsertQueue: ReinsertQueue = action.payload;
  $nodesOfType(TempReinsertNode).forEach((node) => {
    node.remove();
  });
  reinsertQueue.forEach((item) => {
    const node = $createTempReinsertNode();
    const nodesFromText = generateNodesFromText(editor, item.text);
    node.append(...nodesFromText);
    $getStory().append(node);
  });
  if (reinsertQueue.length) {
    const text = document.querySelector("#user-input")?.textContent || "";
    setTimeout(() => {
      socketApi?.submit(text);
    }, 0);
  }
};
