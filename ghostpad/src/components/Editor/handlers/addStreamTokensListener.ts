import { $createTextNode, $nodesOfType } from "lexical";
import { $createTempStreamNode, TempStreamNode } from "../TempStreamNode";
import { ActionNode } from "../ActionNode";
import { store } from "@/store/store";

export const addStreamTokensListener = (action: { payload: string[] }) => {
  const { koboldConfig: config } = store.getState().config;
  if (!config.system?.aibusy) return;
  const tokens = action.payload;
  if (!tokens?.length) return;
  const nodes = tokens.map((token) => {
    const node = $createTempStreamNode();
    const textNode = $createTextNode(token);
    node.append(textNode);
    return node;
  });
  const streamNodes = $nodesOfType(TempStreamNode);
  const [targetNode] = streamNodes.length
    ? streamNodes.slice(-1)
    : $nodesOfType(ActionNode).slice(-1);
  targetNode?.append(...nodes);
};
