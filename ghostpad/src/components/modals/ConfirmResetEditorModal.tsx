import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const ConfirmResetEditorModal = () => {
  const socketApi = useContext(SocketApiContext);
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });
  const dispatch = useDispatch();

  return !modalState.confirmResetEditor.active ? null : (
    <>
      <input
        type="checkbox"
        id="confirm-reset-editor-modal"
        className="modal-toggle"
      />
      <div
        className={"modal modal-open"}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Clear story?</h3>
          <p className="py-4">
            Please confirm that you would like to clear the story. Unsaved changes will be lost.
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("confirmResetEditor"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.newStory();
                dispatch(closeModal("confirmResetEditor"));
              }}
              className="btn"
            >
              Delete
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
