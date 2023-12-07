import { EditorThemeClasses } from "lexical";

import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ActionNode } from "./ActionNode";
import onChange from "./handlers/onChange";
import { KoboldPlugin } from "./KoboldPlugin";
import { useContext } from "react";
import { TempReinsertNode } from "./TempReinsertNode";
import { StoryNode } from "./StoryNode";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { TempStreamNode } from "./TempStreamNode";
import SpeechToTextPlugin from "./SpeechToTextPlugin";
import ChatnamePlugin from "./ChatnamePlugin";

const theme: EditorThemeClasses = {
  root: "min-h-full p-4 editor-root",
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "paragraph",
};

const initialState = `{
    "root": {
      "children": [
        {
          "children":[
            {
              "children":[],
              "direction":null,
              "format":"",
              "indent":0,
              "type":"action",
              "version":1
            }
          ],
          "direction":null,
          "format":"",
          "indent":0,
          "type":"story",
          "version":1
        }
      ],
      "direction":null,
      "format":"",
      "indent":0,
      "type":"root",
      "version":1
    }
  }`;

function onError(error: Error) {
  console.error(error);
}

const initialConfig: InitialConfigType = {
  namespace: "KoboldEditor",
  editorState: initialState,
  editable: true,
  theme,
  onError,
  nodes: [ActionNode, StoryNode, TempReinsertNode, TempStreamNode],
};

function Editor() {
  const socketApi = useContext(SocketApiContext);
  return (
    <div className="overflow-auto flex-1 bg-base-200">
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<></>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange(socketApi)} />
        <ClearEditorPlugin />
        <HistoryPlugin />
        <KoboldPlugin />
        <SpeechToTextPlugin />
        <ChatnamePlugin />
      </LexicalComposer>
    </div>
  );
}

export default Editor;
