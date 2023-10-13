import { store } from "@/store/store";
import {
  resetStory,
  setAudioInEnabled,
  updateKoboldVar,
  updatePendingInsertion,
  updatePendingRetry,
  updateReinsertQueue,
} from "@/store/configSlice";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SocketState, updateSocketState } from "@/store/connectionSlice";
import { koboldConfigMiddleware } from "@/store/koboldConfigMiddleware";
import { StoryNode } from "./StoryNode";
import { storyMutationListener } from "./handlers/storyMutationListener";
import { pendingRetryListener } from "./handlers/pendingRetryListener";
import { pendingInsertionListener } from "./handlers/pendingInsertionListener";
import { resetStoryListener } from "./handlers/resetStoryListener";
import { koboldVarListener } from "./handlers/koboldVarListener";
import { reinsertQueueListener } from "./handlers/reinsertQueueListener";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { addStreamTokens, clearStreamTokens } from "@/store/uiSlice";
import { clearStreamTokensListener } from "./handlers/clearStreamTokensListener";
import { addStreamTokensListener } from "./handlers/addStreamTokensListener";
import { SPEECH_TO_TEXT_COMMAND } from "./SpeechToTextPlugin";

const KoboldPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const dispatch = useDispatch();
  const socketApi = useContext(SocketApiContext);

  useEffect(() => {
    const removeStoryMutationListener = editor.registerMutationListener(
      StoryNode,
      () => {
        editor.update(storyMutationListener);
      }
    );

    const removePendingRetryListener = koboldConfigMiddleware.startListening({
      actionCreator: updatePendingRetry,
      effect: (action) => {
        pendingRetryListener(editor, action, dispatch, socketApi);
      },
    });

    const removePendingInsertionListener =
      koboldConfigMiddleware.startListening({
        actionCreator: updatePendingInsertion,
        effect: (action) => {
          editor.update(() => {
            pendingInsertionListener(action, dispatch);
          });
        },
      });

    const removeResetStoryListener = koboldConfigMiddleware.startListening({
      actionCreator: resetStory,
      effect: () => {
        editor.update(() => {
          resetStoryListener(dispatch);
        });
      },
    });

    const removeAddStreamTokensListener = koboldConfigMiddleware.startListening({
      actionCreator: addStreamTokens,
      effect: (action) => {
        editor.update(() => {
          addStreamTokensListener(action);
        });
      },
    });

    const removeClearStreamTokensListener = koboldConfigMiddleware.startListening({
      actionCreator: clearStreamTokens,
      effect: () => {
        editor.update(() => {
          clearStreamTokensListener();
        });
      },
    });

    const removeKoboldVarListener = koboldConfigMiddleware.startListening({
      actionCreator: updateKoboldVar,
      effect: (action) => {
        editor.update(() => {
          koboldVarListener(editor, action, dispatch);
        });
      },
    });

    const removeReinsertQueueListener = koboldConfigMiddleware.startListening({
      actionCreator: updateReinsertQueue,
      effect: (action) => {
        editor.update(() => {
          reinsertQueueListener(action, socketApi);
        });
      },
    });

    const removeAudioInListener = koboldConfigMiddleware.startListening({
      actionCreator: setAudioInEnabled,
      effect: (action) => {
        editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, action.payload)
      }
    });

    const { socketState } = store.getState().connection;
    if (socketState === SocketState.LOADING) {
      dispatch(
        updateSocketState({ socketState: SocketState.READY_TO_CONNECT })
      );
    }
    return () => {
      removeAddStreamTokensListener();
      removeClearStreamTokensListener();
      removeStoryMutationListener();
      removeReinsertQueueListener();
      removeKoboldVarListener();
      removePendingInsertionListener();
      removePendingRetryListener();
      removeResetStoryListener();
      removeAudioInListener();
    };
  }, [editor, dispatch, socketApi]);

  return null;
};

export { KoboldPlugin };
