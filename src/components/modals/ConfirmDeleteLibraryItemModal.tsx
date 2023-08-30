import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal } from "@/store/uiSlice";
import { LibraryItem } from "./LoadFromLibraryModal";
import { fetchLibraryItems } from "@/util/fetchLibraryItems";
import { deleteLibraryItem } from "@/ghostpadApi/deleteLibraryItem";

export const ConfirmDeleteLibraryItemModal = () => {
  const { modalState } = useSelector((state: RootState) => {
    return state.ui;
  });
  const dispatch = useDispatch();
  if (!modalState.confirmDeleteLibraryItem.data) return null;
  const { itemToDelete, fileType } = modalState.confirmDeleteLibraryItem
    .data as {
    itemToDelete: LibraryItem;
    fileType: string;
  };

  return !modalState.confirmDeleteLibraryItem.active ? null : (
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
            <i>{itemToDelete?.name}</i>.
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("confirmDeleteLibraryItem"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={async () => {
                const res = await deleteLibraryItem(itemToDelete.name, fileType);
                if (res.status === 200) {
                  fetchLibraryItems(fileType).catch((err) => {
                    console.error(err);
                  });
                }
                dispatch(closeModal("confirmDeleteLibraryItem"));
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
