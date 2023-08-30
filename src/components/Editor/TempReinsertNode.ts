import {
  $applyNodeReplacement,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  SerializedElementNode,
  SerializedParagraphNode,
} from "lexical";

export class TempReinsertNode extends ParagraphNode {
  static getType() {
    return "tempreinsert";
  }

  static clone(node: { __key: string }) {
    return new TempReinsertNode(node.__key);
  }

  createDOM(config: EditorConfig) {
    const el = document.createElement("p");
    el.className = "action temp-action paragraph";
    return el;
  }

  updateDOM(
    prevNode: TempReinsertNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): TempReinsertNode {
    const node = $createTempReinsertNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: "tempreinsert",
      version: 1,
    };
  }

  isInline(): boolean {
    return true;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element) {
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

export function $createTempReinsertNode(): TempReinsertNode {
  return $applyNodeReplacement(new TempReinsertNode());
}

export function $isTempReinsertNode(node: LexicalNode | null): boolean {
  return node?.getType() === "tempreinsert";
}