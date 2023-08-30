import { $nodesOfType } from "lexical";
import { TempStreamNode } from "../TempStreamNode";

export const clearStreamTokensListener = () => {
  const streamNodes = $nodesOfType(TempStreamNode);
  streamNodes.forEach((node) => {
    node.remove();
  });
};
