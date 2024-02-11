import { useRef, useContext, useEffect } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { SocketContext } from "./components/SocketProvider";
import { updateGhostpadConfig } from "./store/configSlice";
import { RootState } from "./store/store";
import registerSocketListeners from "./socketApi/socketListeners";
import { Toolbar } from "./components/Toolbar";
import Editor from "./components/Editor/Editor";
import { StoryCommentaryBox } from "./components/StoryCommentaryBox";
import Sidebar from "./components/Sidebar";
import Modals from "./components/modals";
import { SocketApiContext } from "./socketApi/SocketApiProvider";
import cx from "classix";
import { BiPause, BiPlay } from "react-icons/bi";

const PageHead = () => {
  const ghostpadConfig = useSelector(
    (state: RootState) => state.config.ghostpadConfig
  );

  return (
    <Helmet>
      <title>GhostPad</title>;
      <meta name="description" content="AI text generation tool" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no, shrink-to-fit=no"
      />
      <meta name="HandheldFriendly" content="true" />
      {ghostpadConfig && (
        <style>
          {`
            :root {
              --editor-font: '${
                ghostpadConfig.useGoogleFont
                  ? ghostpadConfig.editorGoogleFont.cssFamily
                  : ghostpadConfig.editorLocalFont
              }';
              --editor-font-size: ${ghostpadConfig.editorFontSize}px;
            }
          `}
        </style>
      )}
    </Helmet>
  );
};

const GenerateButton = ({
  textAreaRef,
}: {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  const systemConfig = useSelector(
    (state: RootState) => state.config.koboldConfig.system
  );
  const storyConfig = useSelector(
    (state: RootState) => state.config.koboldConfig.story
  );
  const socketApi = useContext(SocketApiContext);
  return (
    <button
      className={cx(
        "btn w-16 mx-4",
        systemConfig?.aibusy && "hover:bg-error-content"
      )}
      onClick={() => {
        if (systemConfig?.aibusy) {
          socketApi?.abort();
        } else {
          const textArea = textAreaRef?.current;
          if (textArea) {
            const isInitialPrompt =
              storyConfig?.prompt_wi_highlighted_text.length == 0 ||
              storyConfig?.prompt_wi_highlighted_text[0]?.text == "";
            const contentfulActions = storyConfig?.actions.filter((action) => {
              return action?.action?.["Selected Text"].length > 0;
            });
            const lastContentfulAction =
              contentfulActions?.[contentfulActions.length - 1];
            const lastText = lastContentfulAction
              ? lastContentfulAction?.action["Selected Text"]
              : storyConfig?.prompt_wi_highlighted_text[0]?.text;
            const lastChar = lastText?.slice(-1)?.[0] || "";
            const lastCharIsNewline = lastChar == "\n";

            // In story mode, don't let submissions continue on the same line
            if (
              storyConfig?.storymode !== 0 ||
              !textArea.value.length ||
              isInitialPrompt ||
              lastCharIsNewline
            ) {
              socketApi?.submit(textArea.value);
            } else {
              if (lastText?.endsWith("\n\n")) {
                socketApi?.submit(textArea.value.slice(0, -1));
              }

              socketApi?.submit(`\n${textArea.value}`);
            }

            textArea.value = "";
          }
        }
      }}
    >
      {!systemConfig?.aibusy ? (
        <BiPlay size="1.5em" />
      ) : (
        <BiPause size="1.5em" />
      )}
    </button>
  );
};

const SidebarToggle = () => {
  const uiState = useSelector((state: RootState) => state.ui);
  return (
    <input
      id="sidebar-drawer"
      type="checkbox"
      checked={uiState.sidebarState.active}
      className="drawer-toggle"
      readOnly
    />
  );
};

export default function Ghostpad() {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const ghostpadConfig = useSelector(
    (state: RootState) => state.config.ghostpadConfig
  );
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await fetch("/ghostpad/api/config");
      const data = await response.json();
      return data;
    };

    fetchConfig()
      .then((data) => {
        dispatch(updateGhostpadConfig(data));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [dispatch]);

  useEffect(() => {
    registerSocketListeners(dispatch, socket);
  }, [socket, dispatch]);
  if (!ghostpadConfig) {
    return null;
  }

  return (
    <>
      <PageHead />
      <main data-theme={ghostpadConfig?.theme || "garden"}>
        {ghostpadConfig.useGoogleFont && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
            <link
              href={`https://fonts.googleapis.com/css2?family=${ghostpadConfig.editorGoogleFont.linkFamily}:wght@400;700&&display=swap`}
              rel="stylesheet"
            />
          </>
        )}
        <div className="drawer">
          <SidebarToggle />
          <div className="drawer-content h-screen-dvh flex flex-col">
            <Toolbar />
            <Editor />
            <StoryCommentaryBox />
            <div className="h-36 flex justify-center items-center bg-base-300">
              <textarea
                ref={textAreaRef}
                id="user-input"
                className="resize-none textarea textarea-bordered h-24 bg-base-200 w-full max-w-lg p-3 text-sm mx-4 my-2"
              ></textarea>
              <GenerateButton textAreaRef={textAreaRef} />
            </div>
          </div>
          <Sidebar />
          <Modals />
        </div>
      </main>
    </>
  );
}
