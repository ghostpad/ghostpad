import { SyncInput } from "@/components/Forms/SyncInput";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { WorldInfoEntries, WorldInfoEntry } from "@/types/WorldInfo";
import { useContext, useEffect } from "react";
import { AiFillFolder, AiFillFolderOpen } from "react-icons/ai";
import { BiArrowFromTop, BiTrash } from "react-icons/bi";
import { FaFileImport, FaFileExport } from "react-icons/fa6";
import { BsFillPersonFill, BsFillPersonPlusFill } from "react-icons/bs";
import { WorldInfoEntryList } from "./WorldInfoEntryList";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  openModal,
  updateLoadedFile,
  updateMovingWIEntry,
} from "@/store/uiSlice";

export const WorldInfoFolder = ({
  folderName,
  folderUid,
  uids,
  worldInfoEntries,
}: {
  folderName: string;
  folderUid: string;
  uids: number[];
  worldInfoEntries: WorldInfoEntries;
}) => {
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const { timestamps } = useSelector((state: RootState) => state.config);
  const { movingWIEntry, loadedFile } = useSelector((state: RootState) => {
    return state.ui.sidebarState;
  });
  const timestamp = (timestamps["story"]?.["worldinfo"] as number) || 0;

  useEffect(() => {
    if (!loadedFile) return;
    if (loadedFile?.target === `wifolder-${folderUid}`) {
      socketApi?.createWorldInfoEntry({
        ...(loadedFile.content as WorldInfoEntry),
        folder: folderName,
      });
      dispatch(updateLoadedFile(null));
    }
  }, [dispatch, folderName, folderUid, loadedFile, socketApi]);

  return (
    <details
      className="collapse collapse-arrow bg-base-200 mb-2 relative overflow-visible border border-neutral"
      open
    >
      {movingWIEntry !== null && (
        <button
          className="absolute inset-0 p-2 bg-black/70 text-center z-50"
          onClick={() => {
            socketApi?.moveWorldInfoEntry(movingWIEntry, folderName);
            dispatch(updateMovingWIEntry(null));
          }}
        >
          <BiArrowFromTop className="inline text-white" size="4.5em" />
        </button>
      )}
      <summary
        onKeyUp={(e) => {
          // Prevent the spacebar from triggering the dropdown when editing the title
          if (
            e.key === " " &&
            document.querySelectorAll("input:focus").length
          ) {
            e.preventDefault();
          }
        }}
        className="collapse-title !flex items-center"
      >
        <AiFillFolder size="1.5em" className="inline pr-2 flex-shrink-0" />
        <SyncInput
          timestamp={timestamp}
          disabled={folderUid === "-1"}
          value={folderUid === "-1" ? "Main Entries" : folderName}
          onChange={
            folderUid === "-1"
              ? undefined
              : (evt, localValue) => {
                  socketApi?.renameWorldInfoFolder(
                    localValue,
                    evt.target.value
                  );
                }
          }
        />
      </summary>
      <div className="collapse-content px-0 pt-8 border-t border-neutral">
        <div className="flex px-4 mb-4 space-x-2">
          <div
            className="dropdown dropdown-bottom dropdown-end flex-1"
            title="Import or export JSON files containing world info folders."
          >
            <label tabIndex={1} className="btn btn-sm btn-neutral mb-2 w-full">
              <AiFillFolderOpen size="1.5em" /> Folder Options
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-md p-2 shadow rounded-box w-72 bg-base-100 z-[1]"
            >
              <li>
                <label
                  htmlFor={`json-import-${folderUid}`}
                  className="flex flex-row justify-start"
                >
                  <FaFileImport size="1.5em" /> Import
                </label>
                <input
                  type="file"
                  className="hidden"
                  id={`json-import-${folderUid}`}
                  name={`json-import-${folderUid}`}
                  accept="application/json"
                  onChange={(e) => {
                    const { files } = e.target;
                    if (!files) return;
                    for (const file of files) {
                      const reader = new FileReader();
                      reader.onload = (evt: ProgressEvent<FileReader>) => {
                        if (evt?.target?.result) {
                          socketApi?.uploadWorldInfoFolder(
                            folderName,
                            file.name,
                            evt.target.result
                          );
                        }
                      };
                      reader.readAsArrayBuffer(file);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    document.location.href = `//${window.location.host}/export_world_info_folder?folder=${folderName}`;
                  }}
                  className="flex flex-row justify-start"
                >
                  <FaFileExport size="1.5em" /> Export
                </button>
                {folderUid !== "-1" && (
                  <button
                    className="flex flex-row justify-start"
                    onClick={() => {
                      socketApi?.deleteWorldInfoFolder(folderName);
                    }}
                  >
                    <BiTrash size="1.5em" /> Delete Folder And Entries
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center space-x-2 px-4 mb-4 flex">
          <button
            className="btn btn-sm btn-neutral px-4 w-1/2"
            title="Load a world info entry from the library."
            onClick={() => {
              dispatch(
                openModal({
                  name: "loadFromLibrary",
                  data: { fileType: "wi", target: `wifolder-${folderUid}` },
                })
              );
            }}
          >
            <BsFillPersonFill size="1.5em" /> Load
          </button>
          <button
            className="btn btn-sm btn-primary px-4 w-1/2"
            title="Create a new world info entry."
            onClick={() => {
              socketApi?.createWorldInfoEntry({
                folder: folderName,
                type: "constant",
                constant: true,
              });
            }}
          >
            <BsFillPersonPlusFill size="1.5em" />
            New
          </button>
        </div>
        <div className="flex space-x-2 px-4 mb-4"></div>
        <WorldInfoEntryList
          folderName={folderName}
          uids={uids}
          worldInfoEntries={worldInfoEntries}
        />
      </div>
    </details>
  );
};
