import {
  setAudioInEnabled,
  setAudioOutEnabled,
  updatePendingInsertion,
  updatePendingRetry,
} from "@/store/configSlice";
import { RootState } from "@/store/store";
import { openModal, openSidebar } from "@/store/uiSlice";
import { useContext, useState } from "react";
import {
  BiEraser,
  BiLeftArrowAlt,
  BiMenu,
  BiRefresh,
  BiRightArrowAlt,
} from "react-icons/bi";
import {
  BsBoxArrowInRight,
  BsFillMicFill,
  BsSpeakerFill,
  BsThreeDots,
} from "react-icons/bs";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const Toolbar = () => {
  const dispatch = useDispatch();
  const { koboldConfig, audioInEnabled, audioOutEnabled } = useSelector(
    (state: RootState) => {
      return {
        koboldConfig: state.config.koboldConfig,
        audioInEnabled: state.config.audioInEnabled,
        audioOutEnabled: state.config.audioOutEnabled,
      };
    },
    shallowEqual
  );
  const socketApi = useContext(SocketApiContext);
  const handleRedo = () => {
    const currentAction = koboldConfig.actions?.["Action Count"];
    if (typeof currentAction !== "number") return;
    const nextAction = koboldConfig.story?.actions[currentAction + 1];
    const hasOptions = !!nextAction && nextAction.action.Options.length > 1;
    if (hasOptions) {
      dispatch(
        openModal({
          name: "selectOption",
          data: { actionId: nextAction.id },
        })
      );
    } else {
      socketApi?.redo();
    }
  };

  return (
    <div className="h-16 flex justify-between items-center bg-base-300">
      <div className="left-icons">
        <label
          className="btn drawer-button ml-4"
          onClick={() => {
            dispatch(openSidebar());
          }}
        >
          <BiMenu size="1.5em" />
        </label>
      </div>
      <div className="right-icons flex">
        <button
          className="btn btn-error mr-4"
          title="Clear the story and start over"
          disabled={koboldConfig.system?.aibusy || false}
          onClick={() => {
            dispatch(openModal({ name: "confirmResetEditor" }));
          }}
        >
          <BiEraser size="1.5em" />
        </button>
        <button
          className="btn mr-4"
          disabled={koboldConfig.system?.aibusy || false}
          onClick={() => {
            dispatch(updatePendingRetry(true));
          }}
        >
          <BiRefresh size="1.5em" />
        </button>
        <div className="dropdown dropdown-bottom dropdown-end">
          <label tabIndex={0} className="btn mr-4">
            <BsThreeDots size="1.5em" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-md p-2 shadow rounded-box w-52 bg-base-100"
          >
            <li>
              <button
                title="Undo on the Kobold backend. Different from CTRL+Z and may not be compatible with all Ghostpad features."
                disabled={koboldConfig.system?.aibusy || false}
                onClick={() => {
                  socketApi?.back();
                }}
                className="flex flex-row justify-start"
              >
                <BiLeftArrowAlt size="1.5em" />
                <span>Undo Generation</span>
              </button>
            </li>
            <li>
              <button
                disabled={koboldConfig.system?.aibusy || false}
                onClick={handleRedo}
                className="flex flex-row justify-start"
                title="Redo on the Kobold backend. Different from CTRL+Shift+Z and may not be compatible with all Ghostpad features."
              >
                <BiRightArrowAlt size="1.5em" />
                <span>Redo Generation</span>
              </button>
            </li>
            <li>
              <button
                title="Generate from the cursor position"
                disabled={koboldConfig.system?.aibusy || false}
                onClick={() => {
                  dispatch(updatePendingInsertion(true));
                }}
                className="flex flex-row justify-start"
              >
                <BsBoxArrowInRight size="1.5em" />
                <span>Continue</span>
              </button>
            </li>
            <li>
              <button
                title="Toggle microphone speech recognition"
                onClick={() => {
                  dispatch(setAudioInEnabled(!audioInEnabled));
                }}
                className="flex flex-row justify-start"
              >
                <BsFillMicFill size="1.5em" />
                <span>{audioInEnabled ? "Disable" : "Enable"} Audio In</span>
              </button>
              <button
                title="Toggle audio-only communication"
                onClick={() => {
                  dispatch(setAudioOutEnabled(!audioOutEnabled));
                }}
                className="flex flex-row justify-start"
              >
                <BsSpeakerFill size="1.5em" />
                <span>{audioOutEnabled ? "Disable" : "Enable"} Audio Out</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
