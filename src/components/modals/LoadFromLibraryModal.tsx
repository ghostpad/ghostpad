import { RootState } from "@/store/store";
import { closeModal, openModal, updateLoadedFile } from "@/store/uiSlice";
import { fetchLibraryItems } from "@/util/fetchLibraryItems";
import cx from "classix";
import { useEffect, useState, Dispatch, SetStateAction, useRef } from "react";
import { BiCheck, BiPencil, BiTrash, BiX } from "react-icons/bi";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { sanitizeFilename } from "@/util/sanitizeFilename";
import { renameLibraryItem } from "@/ghostpadApi/renameLibraryItem";
import { loadLibraryItem } from "@/ghostpadApi/loadLibraryItem";
export type LibraryItem = { name: string; filename: string };

const LibraryNameEditor = ({
  item,
  fileType,
  setEditingItem,
}: {
  item: LibraryItem;
  fileType: string;
  setEditingItem: Dispatch<SetStateAction<string | null>>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [newName, setNewName] = useState(item.name);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <input
        className="input input-sm bg-base-200 py-0 pl-4 border-0 max-w-none w-full !cursor-text"
        type="text"
        value={newName}
        onChange={(e) => setNewName(sanitizeFilename(e.target.value))}
        ref={inputRef}
      />

      <button
        className="px-4 py-2"
        onClick={() => {
          setEditingItem(null);
        }}
      >
        <BiX size="1.5em" />
      </button>
      <button
        className="px-4 py-2"
        onClick={async () => {
          if (newName.length) {
            const res = await renameLibraryItem(
              item.filename,
              newName,
              fileType
            );

            if (res.status == 200) {
              fetchLibraryItems(fileType).catch((err) => {
                console.error(err);
              });
            }
          }
          setEditingItem(null);
        }}
      >
        <BiCheck size="1.5em" />
      </button>
    </>
  );
};

export const LoadFromLibraryModal = () => {
  const { modalState, libraryItems } = useSelector((state: RootState) => {
    return {
      modalState: state.ui.modalState,
      libraryItems: state.ui.libraryItems,
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const { fileType, target } = {
    ...(modalState.loadFromLibrary.data
      ? (modalState.loadFromLibrary.data as {
          // "wi" | "text" - the subdirectory to load from
          fileType: string;
          // "wi-[uid]" | "wifolder-[uid]" | "memory" | "authorsnote" - the field that the file will be loaded into
          // These targets are listened for in their respective components
          target: string;
        })
      : {}),
  };

  useEffect(() => {
    fetchLibraryItems(fileType).catch((err) => {
      console.error(err);
    });
  }, [fileType]);

  if (!fileType || !target) {
    return null;
  }

  return !modalState.loadFromLibrary.active ? null : (
    <>
      <input
        type="checkbox"
        id="load-from-library-modal"
        className="modal-toggle"
      />
      <div className={"modal modal-open"}>
        <div className="modal-box flex flex-col">
          <h3 className="font-bold text-lg">Load From Library</h3>
          {!libraryItems.length && (
            <div className="text-center mt-6">No entries found.</div>
          )}
          {!!libraryItems.length && (
            <ul className="menu menu-md overflow-y-auto flex-nowrap ">
              {libraryItems.map((item) => {
                return (
                  <li
                    className="w-full flex flex-row flex-nowrap h-10 items-center"
                    key={item.filename}
                  >
                    {editingItem === item.filename && (
                      <LibraryNameEditor
                        item={item}
                        fileType={fileType}
                        setEditingItem={setEditingItem}
                        key={item.filename}
                      />
                    )}
                    {editingItem !== item.filename && (
                      <>
                        <label
                          onClick={() => {
                            if (selectedItem === item) {
                              setSelectedItem(null);
                            } else {
                              setSelectedItem(item);
                            }
                          }}
                          className={cx(
                            "flex-grow block py-0 h-10 leading-10 content-center whitespace-nowrap overflow-hidden overflow-ellipsis",
                            selectedItem === item && "active"
                          )}
                        >
                          {item.name}
                        </label>
                        <button
                          onClick={() => {
                            setEditingItem(item.filename);
                          }}
                        >
                          <BiPencil size="1.5em" />
                        </button>
                        <button
                          onClick={() => {
                            dispatch(
                              openModal({
                                name: "confirmDeleteLibraryItem",
                                data: { itemToDelete: item, fileType },
                              })
                            );
                          }}
                        >
                          <BiTrash size="1.5em" />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="modal-action">
            <label
              onClick={() => {
                dispatch(closeModal("loadFromLibrary"));
              }}
              className="btn"
            >
              Cancel
            </label>
            <label
              onClick={async () => {
                if (
                  selectedItem &&
                  fileType &&
                  selectedItem.filename &&
                  target
                ) {
                  const res = await loadLibraryItem(
                    fileType,
                    selectedItem.filename
                  );

                  if (res.status !== 200) {
                    console.error("Failed to load from library");
                    return;
                  }
                  const { fileContents } = await res.json();
                  dispatch(
                    updateLoadedFile({
                      name: selectedItem.name,
                      filename: selectedItem.filename,
                      content: fileContents,
                      fileType,
                      target,
                    })
                  );
                }
                dispatch(closeModal("loadFromLibrary"));
              }}
              className="btn"
            >
              Load
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
