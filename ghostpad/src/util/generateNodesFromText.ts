import { $createLineBreakNode, $createTextNode, LexicalNode } from "lexical";

const generateNodesFromText = (text: string) => {
  const nodes : LexicalNode[] = [];
  const newlineRegex = /(:?\r\n|\r|\n)/g;
  const textNodeContents = text.split(newlineRegex);
  textNodeContents.forEach((nodeText) => {
    if (nodeText === "") return;
    if (newlineRegex.test(nodeText)) {
      const lineBreakNode = $createLineBreakNode();
      nodes.push(lineBreakNode);
      return;
    }

    const textNode = $createTextNode(nodeText);
    nodes.push(textNode);
  });

  return nodes;
};

export default generateNodesFromText;
