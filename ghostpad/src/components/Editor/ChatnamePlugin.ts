import type { LexicalEditor } from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";
import { useEffect } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { KoboldConfig } from "@/types/KoboldConfig";

const findAllIndices = (text: string, searchStr: string) => [
  ...text.matchAll(new RegExp(searchStr, "gi")),
];

function findAndTransformChatnames(
  node: TextNode,
  koboldConfig: Partial<KoboldConfig>
): null | TextNode {
  const text = node.getTextContent();

  if (!(koboldConfig.story?.chatname && koboldConfig.story.botname))
    return null;

  if (node?.getStyle() === "font-weight:600;") {
    if (
      text !== koboldConfig.story?.chatname + ":" &&
      text !== koboldConfig.story?.botname + ":"
    ) {
      node.setStyle("");
    }
  }

  const chatnameIndices = [
    ...findAllIndices(text, koboldConfig.story.botname + ":"),
    ...findAllIndices(text, koboldConfig.story.chatname + ":"),
  ];

  chatnameIndices.forEach((chatnameIndex) => {
    const { index } = chatnameIndex;
    const length = chatnameIndex[0].length;
    if (typeof length === "undefined") return;
    let targetNode;
    if (index === 0) {
      [targetNode] = node.splitText(index + length);
    } else if (index) {
      [, targetNode] = node.splitText(index, index + length);
    }
    if (targetNode?.getStyle() !== "font-weight:600;") {
      targetNode?.setStyle("font-weight:600;");
    }
  });


  return null;
}

function textNodeTransform(koboldConfig: Partial<KoboldConfig>) {
  return (node: TextNode) => {
    let targetNode: TextNode | null = node;

    while (targetNode !== null) {
      if (!targetNode.isSimpleText()) {
        return;
      }

      targetNode = findAndTransformChatnames(targetNode, koboldConfig);
    }
  };
}

function useChatnamesFormatter(
  editor: LexicalEditor,
  koboldConfig: Partial<KoboldConfig>
): void {
  useEffect(() => {
    if (!koboldConfig.story?.chatmode) {
      return;
    }

    const cleanupNodeTransform = editor.registerNodeTransform(
      TextNode,
      textNodeTransform(koboldConfig)
    );
    return cleanupNodeTransform;
  }, [
    editor,
    koboldConfig.story?.chatmode,
    koboldConfig.story?.chatname,
    koboldConfig.story?.botname,
  ]);
}

export default function ChatnamesPlugin(): JSX.Element | null {
  const koboldConfig = useSelector(
    (state: RootState) => state.config.koboldConfig
  );
  const [editor] = useLexicalComposerContext();
  useChatnamesFormatter(editor, koboldConfig);
  return null;
}
