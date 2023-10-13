import {
  $applyNodeReplacement,
  $nodesOfType,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  SerializedParagraphNode,
} from "lexical";

export class StoryNode extends ElementNode {
  static getType() {
    return "story";
  }

  static clone(node: { __key: string }) {
    return new StoryNode(node.__key);
  }

  createDOM() {
    const el = document.createElement("p");
    el.className = "story";
    return el;
  }

  isShadowRoot(): boolean {
    return true;
  }

  updateDOM(
  ): boolean {
    return false;
  }
  
  static importJSON(serializedNode: SerializedParagraphNode): StoryNode {
    const node = $createStoryNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: "paragraph",
      version: 1,
    };
  }
  
  isInline(): boolean {
    return false;
  }
}

export function $createStoryNode(): StoryNode {
  return $applyNodeReplacement(new StoryNode());
}

export function $getStory(): StoryNode {
  return $nodesOfType(StoryNode)[0];
}

export function $isStoryNode(node: LexicalNode | null): boolean {
  return node?.getType() === "story";
}