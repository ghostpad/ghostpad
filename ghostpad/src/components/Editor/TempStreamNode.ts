import {
  $applyNodeReplacement,
  DOMExportOutput,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  SerializedElementNode,
  SerializedParagraphNode,
} from "lexical";

export class TempStreamNode extends ParagraphNode {
  static getType() {
    return "tempstream";
  }

  static clone(node: { __key: string }) {
    return new TempStreamNode(node.__key);
  }

  createDOM() {
    const el = document.createElement("p");
    el.className = "action temp-action paragraph";
    return el;
  }

  updateDOM(
  ): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): TempStreamNode{
    const node = $createTempStreamNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: "tempstream",
      version: 1,
    };
  }

  isInline(): boolean {
    return true;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element instanceof HTMLElement) {
      const formatType = this.getFormatType();
      element.style.textAlign = formatType;

      const indent = this.getIndent();
      if (indent > 0) {
        element.style.textIndent = `${indent * 20}px`;
      }
    }

    return {
      element,
      after: (generatedEl) => {return generatedEl}
    };
  }
}

export function $createTempStreamNode(): TempStreamNode{
  return $applyNodeReplacement(new TempStreamNode());
}

export function $isTempStreamNode(node: LexicalNode | null): boolean {
  return node?.getType() === "tempstream";
}