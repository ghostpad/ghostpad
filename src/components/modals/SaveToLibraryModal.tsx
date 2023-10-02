import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "@/store/uiSlice";
import { WorldInfoEntry } from "@/types/WorldInfo";
import { sanitizeFilename } from "@/util/sanitizeFilename";
import { saveLibraryItem } from "@/ghostpadApi/saveLibraryItem";

export const SaveToLibraryModal = () => {
  const modalState = useSelector((state: RootState) => {
    return state.ui.modalState;
  });
  const dispatch = useDispatch();
  const data = modalState.saveToLibrary.data as
    | {
        fileType: string;
        content: WorldInfoEntry | string;
      }
    | undefined;
  const [filename, setFilename] = useState("");

  useEffect(() => {
    // Pre-populate filename based on world info when available
    if (data?.fileType === "wi" && typeof data.content !== "string") {
      setFilename(`${sanitizeFilename(data.content.title)}`);
    } else {
      setFilename("");
    }
  }, [data?.content, data?.fileType]);

  if (!data) {
    return null;
  }

  const contentStr =
    typeof data.content === "string"
      ? data.content
      : JSON.stringify(data.content, null, 2);

  return !modalState.saveToLibrary.active ? null : (
    <>
      <input
        type="checkbox"
        id="save-to-library-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box">
          <input
            type="text"
            className="input input-bordered w-full mb-4"
            placeholder="Filename (No extension)"
            value={filename}
            onChange={(e) => {
              setFilename(sanitizeFilename(e.target.value));
            }}
          />
          <div className="modal-action">
            <label
              onClick={() => dispatch(closeModal("saveToLibrary"))}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={async () => {
                const res = await saveLibraryItem(
                  filename,
                  data.fileType,
                  contentStr,
                  false
                );

                if (res.status === 409) {
                  dispatch(
                    openModal({
                      name: "confirmOverwriteLibraryFile",
                      data: {
                        filename,
                        content: contentStr,
                        fileType: data.fileType,
                      },
                    })
                  );
                } else if (res.status !== 200) {
                  console.error("Failed to save to library");
                }

                dispatch(closeModal("saveToLibrary"));
              }}
              className="btn"
            >
              Save
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
