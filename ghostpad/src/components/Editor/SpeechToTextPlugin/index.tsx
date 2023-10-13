/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-refresh/only-export-components */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in this directory.
 *
 */

import type { LexicalCommand,
  // LexicalEditor,
  // RangeSelection 
} from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  // REDO_COMMAND,
  // UNDO_COMMAND,
} from "lexical";
import { useContext, useEffect, useRef, useState } from "react";

import useReport from "./useReport";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  "SPEECH_TO_TEXT_COMMAND"
);

// const VOICE_COMMANDS: Readonly<
//   Record<
//     string,
//     (arg0: { editor: LexicalEditor; selection: RangeSelection }) => void
//   >
// > = {
//   "new line": ({ selection }) => {
//     selection.insertParagraph();
//   },
//   "newline": ({ selection }) => {
//     selection.insertParagraph();
//   },
//   "question mark": ({ selection }) => {
//     selection.insertText("?");
//   },
//   "period": ({ selection }) => {
//     selection.insertText(".");
//   },
//   redo: ({ editor }) => {
//     editor.dispatchCommand(REDO_COMMAND, undefined);
//   },
//   undo: ({ editor }) => {
//     editor.dispatchCommand(UNDO_COMMAND, undefined);
//   },
// };

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

function SpeechToTextPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const socketApi = useContext(SocketApiContext);
  const SpeechRecognition =
    // @ts-ignore
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef<typeof SpeechRecognition | null>(null);
  const report = useReport();
  const utteranceInProgress = useSelector((state: RootState) => {
    return state.config.utteranceInProgress;
  });

  useEffect(() => {
    const resultListener = (event: typeof SpeechRecognition) => {
      const resultItem = event.results.item(event.resultIndex);
      const { transcript } = resultItem.item(0);
      if (utteranceInProgress) {
        return;
      }

      report(transcript);

      if (!resultItem.isFinal) {
        return;
      }

      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          // const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];

          // TODO: Determine which commands to support
          // if (command) {
          //   command({
          //     editor,
          //     selection,
          //   });
          // } else if (transcript.match(/\s*\n\s*/)) {
          //   selection.insertParagraph();
          // } else {
          socketApi?.submit(transcript+ "\n");
          // }
        }
      });
    };

    if (isEnabled && recognition.current === null) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.addEventListener("result", resultListener);
    }

    if (recognition.current) {
      if (isEnabled) {
        recognition.current.start();
      } else {
        recognition.current.stop();
      }
    }

    return () => {
      if (recognition.current !== null) {
        recognition.current.stop();
      }
      recognition.current?.removeEventListener("result", resultListener);
      recognition.current = null;
    };
  }, [SpeechRecognition, editor, isEnabled, report, utteranceInProgress, socketApi]);
  useEffect(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled: boolean) => {
        setIsEnabled(_isEnabled);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}

export default (SUPPORT_SPEECH_RECOGNITION
  ? SpeechToTextPlugin
  : () => null) as () => null;
