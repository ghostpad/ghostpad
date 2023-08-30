import {
  $applyNodeReplacement,
  EditorConfig,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  SerializedParagraphNode,
} from "lexical";

export class ActionNode extends ElementNode {
  protected actionId?: number;

  static getType() {
    return "action";
  }

  static clone(node: ActionNode) {
    return new ActionNode(node.__key, node.actionId);
  }

  constructor(nodeKey?: string, actionId?: number) {
    super(nodeKey);

    this.actionId = actionId;
  }

  public getActionId() {
    return this.actionId;
  }

  createDOM(config: EditorConfig) {
    const el = document.createElement("div");
    el.className = `action paragraph action-${this.actionId ?? "prompt"}`;
    return el;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): ActionNode {
    const node = $createActionNode();
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

export function $isActionNode(node: LexicalNode | null): boolean {
  return node?.getType() === "action";
}

export function $createActionNode(actionId?: number): ActionNode {
  return $applyNodeReplacement(new ActionNode(undefined, actionId));
}
