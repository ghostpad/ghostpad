import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal } from "@/store/uiSlice";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { WorldInfoEntry } from "@/types/WorldInfo";

export const ConfirmDeleteEntryModal = () => {
  const socketApi = useContext(SocketApiContext);
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });
  const dispatch = useDispatch();
  const entryToDelete = modalState.confirmDeleteEntry?.data as WorldInfoEntry;

  return !modalState.confirmDeleteEntry.active ? null : (
    <>
      <input
        type="checkbox"
        id="confirm-delete-entry-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete entry?</h3>
          <p className="py-4">
            Please confirm that you would like to permanently delete{" "}
            <i>{entryToDelete?.title}</i>.
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("confirmDeleteEntry"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={() => {
                socketApi?.deleteWorldInfoEntry(entryToDelete.uid);
                dispatch(closeModal("confirmDeleteEntry"));
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
