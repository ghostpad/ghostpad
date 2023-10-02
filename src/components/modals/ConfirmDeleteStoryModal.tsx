import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal, SavedStory } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";

export const ConfirmDeleteStoryModal = () => {
  const socketApi = useContext(SocketApiContext);
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });
  const dispatch = useDispatch();
  const storyToDelete = modalState.confirmDeleteStory?.data as SavedStory;

  return !modalState.confirmDeleteStory.active ? null : (
    <>
      <input
        type="checkbox"
        id="confirm-delete-story-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Story?</h3>
          <p className="py-4">
            Please confirm that you would like to permanently delete{" "}
            <i>{storyToDelete?.name}</i>.
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("confirmDeleteStory"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.deleteStory(storyToDelete.path);
                dispatch(closeModal("confirmDeleteStory"));
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
