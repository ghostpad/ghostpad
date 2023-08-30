import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeModal } from "@/store/uiSlice";
import { saveLibraryItem } from "@/ghostpadApi/saveLibraryItem";

export const ConfirmOverwriteLibraryFileModal = () => {
  const { modalState } = useSelector((state: RootState) => {
    return state.ui;
  });
  const dispatch = useDispatch();
  if (!modalState.confirmOverwriteLibraryFile.data) return null;
  const { filename, content, fileType } = modalState.confirmOverwriteLibraryFile
    ?.data as {
    filename: string;
    content: string;
    fileType: string;
  };

  return !modalState.confirmOverwriteLibraryFile.active ? null : (
    <>
      <input
        type="checkbox"
        id="confirm-overwrite-library-file-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Overwrite existing file?</h3>
          <p className="py-4">
            Please confirm that you would like to overwrite <i>{filename}</i>.
          </p>
          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("confirmOverwriteLibraryFile"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={async () => {
                const res = await saveLibraryItem(
                  filename,
                  fileType,
                  content,
                  true
                );

                if (res.status !== 200) {
                  alert("Error overwriting file.");
                }

                dispatch(closeModal("confirmOverwriteLibraryFile"));
              }}
              className="btn"
            >
              Overwrite
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
