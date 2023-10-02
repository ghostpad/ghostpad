import Head from "next/head";
import * as R from "ramda";
import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";
import { BiPlay, BiPause } from "react-icons/bi";
import Sidebar from "@/components/Sidebar";
import { SocketContext } from "@/components/SocketProvider";
import Modals from "@/components/modals";
import cx from "classix";
import registerSocketListeners from "@/socketApi/socketListeners";
import { GetServerSideProps } from "next";
import { readGhostpadConfig } from "@/fileApi/config";
import { GhostpadConfig, updateGhostpadConfig } from "@/store/configSlice";
import defaultGhostpadConfig from "@/fileApi/defaultGhostpadConfig";
import { Toolbar } from "@/components/Toolbar";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { StoryCommentaryBox } from "@/components/StoryCommentaryBox";

const Editor = dynamic(() => import("../components/Editor/Editor"), {
  ssr: false,
});

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
              storyConfig?.prompt_wi_highlighted_text.length == 0;
            const contentfulActions = storyConfig?.actions.filter((action) => {
              return action?.action["Selected Text"].length > 0;
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

const PageHead = () => {
  const systemConfig = useSelector(
    (state: RootState) => state.config.koboldConfig.system
  );
  const ghostpadConfig = useSelector(
    (state: RootState) => state.config.ghostpadConfig
  );

  return (
    <Head>
      <title>InferLab - ${`${systemConfig?.status_message}`}</title>;
      <meta name="description" content="AI text generation tool" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no, shrink-to-fit=no"
      />
      <meta name="HandheldFriendly" content="true" />
      <link rel="icon" href="/favicon.ico" />
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
    </Head>
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

export default function InferStudio({
  initialGhostpadConfig,
}: {
  initialGhostpadConfig: GhostpadConfig;
}) {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const ghostpadConfig = useSelector(
    (state: RootState) => state.config.ghostpadConfig
  );
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    dispatch(updateGhostpadConfig(initialGhostpadConfig));
  }, [dispatch, initialGhostpadConfig]);

  useEffect(() => {
    registerSocketListeners(dispatch, socket);
  }, [socket, dispatch]);

  return (
    <>
      <PageHead />
      <main
        data-theme={
          ghostpadConfig?.theme || initialGhostpadConfig?.theme || "garden"
        }
      >
        {ghostpadConfig.useGoogleFont && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
            <link
              href={`https://fonts.googleapis.com/css2?family=${ghostpadConfig.editorGoogleFont.linkFamily}&display=swap`}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ghostpadConfig = R.mergeDeepRight(
    defaultGhostpadConfig,
    readGhostpadConfig()
  );

  return {
    props: { initialGhostpadConfig: ghostpadConfig },
  };
};
