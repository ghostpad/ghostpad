import * as R from "ramda";
import { SyncInput, SyncToggle } from "@/components/Forms/SyncInput";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import {
  openModal,
  setIsLoadingWi,
  toggleEntryVisibility,
  updateLoadedFile,
  updateMovingWIEntry,
} from "@/store/uiSlice";
import { WPPFormat, WorldInfoEntry } from "@/types/WorldInfo";
import { useContext, useEffect } from "react";
import { BiMove, BiNotepad, BiTrash } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  PiEyeDuotone,
  PiEyeSlashDuotone,
  PiBracketsCurlyBold,
} from "react-icons/pi";
import { BsFillPersonFill, BsThreeDots } from "react-icons/bs";
import { RootState } from "@/store/store";
import { SyncTextarea } from "@/components/Forms/SyncTextarea";
import { WPPEditor } from "./WPPEditor";
import { FaRobot } from "react-icons/fa6";
import { updateLocalSequenceNumber } from "@/store/configSlice";
import { getSequenceNumber } from "@/util/getSequenceNumber";

export const WorldInfoCard = ({
  worldInfoEntry,
}: {
  worldInfoEntry: WorldInfoEntry;
}) => {
  const socketApi = useContext(SocketApiContext);
  const dispatch = useDispatch();
  const { sequenceNumbers } = useSelector((state: RootState) => state.config);
  const { hiddenEntries, loadedFile, isGeneratingWI } = useSelector(
    (state: RootState) => {
      return state.ui.sidebarState;
    }
  );
  const [sequenceNumber, isSynced] = getSequenceNumber(
    "story_worldinfo",
    sequenceNumbers
  );
  const isHidden = hiddenEntries.includes(worldInfoEntry.uid);
  useEffect(() => {
    if (!loadedFile) return;
    if (loadedFile?.target === `wi-${worldInfoEntry.uid}`) {
      if (loadedFile.fileType === "text") {
        const { manual_text: manualText } = worldInfoEntry;
        socketApi?.editWorldInfoEntry({
          ...worldInfoEntry,
          manual_text:
            manualText + (manualText.length ? "\n\n" : "") + loadedFile.content,
        });
      } else if (loadedFile.fileType === "wi") {
        const { attributes: wppAttrs } = worldInfoEntry.wpp;
        const newWPPAttrs = R.mergeDeepWith(
          R.concat,
          wppAttrs,
          (loadedFile.content as WorldInfoEntry).wpp.attributes
        );
        socketApi?.editWorldInfoEntry({
          ...worldInfoEntry,
          wpp: {
            ...worldInfoEntry.wpp,
            attributes: newWPPAttrs,
          },
        });
      }
      dispatch(updateLoadedFile(null));
    }
  }, [dispatch, loadedFile, socketApi, worldInfoEntry]);

  return (
    <li className="bg-base-300/80 p-4 mx-4 border border-neutral-focus rounded-lg">
      <div className="flex justify-between">
        <div className="ml-2 dropdown dropdown-bottom dropdown-end order-3">
          <label tabIndex={0} className="btn btn-sm">
            <BsThreeDots size="1.5em" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-md p-2 shadow rounded-box w-52 bg-base-100 z-[1]"
          >
            <li>
              <button
                className="flex flex-row justify-start"
                onClick={() => {
                  (document.activeElement as HTMLElement).blur();
                  dispatch(updateMovingWIEntry(worldInfoEntry.uid));
                }}
              >
                <BiMove size="1.5em" /> Move Entry
              </button>
            </li>
            <li>
              <button
                className="flex flex-row justify-start"
                onClick={() => {
                  (document.activeElement as HTMLElement).blur();
                  dispatch(
                    openModal({
                      name: "confirmDeleteEntry",
                      data: worldInfoEntry,
                    })
                  );
                }}
              >
                <BiTrash size="1.5em" /> Delete Entry
              </button>
            </li>
          </ul>
        </div>
        <button
          className="btn btn-sm btn-ghost px-0"
          onClick={() => {
            dispatch(toggleEntryVisibility(worldInfoEntry.uid));
          }}
        >
          {isHidden ? (
            <PiEyeSlashDuotone size="1.5em" className="self-center" />
          ) : (
            <PiEyeDuotone size="1.5em" className="self-center" />
          )}
        </button>
        <SyncInput
          value={worldInfoEntry.title}
          isSynced={isSynced}
          className="flex-grow ml-2 font-semibold"
          inputClassname="input input-sm bg-transparent border-0 text-sm w-full"
          onChange={(evt) => {
            socketApi?.editWorldInfoEntry({
              ...worldInfoEntry,
              title: evt.target.value,
              wpp: {
                ...worldInfoEntry.wpp,
                name: evt.target.value,
              },
            });
            dispatch(
              updateLocalSequenceNumber({
                key: "story_worldinfo",
                sequenceNumber: sequenceNumber + 1,
              })
            );
          }}
        />
      </div>
      {!isHidden && (
        <div>
          <SyncInput
            className="my-2"
            isSynced={isSynced}
            value={worldInfoEntry.object_type || worldInfoEntry.wpp.type || ""}
            label="Type"
            onChange={(evt) => {
              socketApi?.editWorldInfoEntry({
                ...worldInfoEntry,
                object_type: evt.target.value,
                wpp: {
                  ...worldInfoEntry.wpp,
                  type: evt.target.value,
                },
              });
              dispatch(
                updateLocalSequenceNumber({
                  key: "story_worldinfo",
                  sequenceNumber: sequenceNumber + 1,
                })
              );
            }}
          />
          <div className="flex mb-2">
            <span className="text-sm">Trigger</span>
          </div>
          <select
            className="select select-sm select-bordered bg-base-200 w-full max-w-xs"
            onChange={(evt) => {
              socketApi?.editWorldInfoEntry({
                ...worldInfoEntry,
                constant: evt.target.value !== "wi",
                type: evt.target.value,
              });
              dispatch(
                updateLocalSequenceNumber({
                  key: "story_worldinfo",
                  sequenceNumber: sequenceNumber + 1,
                })
              );
            }}
            value={worldInfoEntry.type}
          >
            {[
              ["constant", "Always On"],
              ["chatcharacter", "Chat Character"],
              ["wi", "Keywords"],
              ["commentator", "Commentator"],
            ].map((option) => (
              <option key={option[0]} value={option[0]}>
                {option[1]}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              dispatch(
                openModal({
                  name: "saveToLibrary",
                  data: {
                    fileType: "wi",
                    content: worldInfoEntry,
                  },
                })
              );
            }}
            className="btn btn-sm btn-primary w-full mt-4"
          >
            <BsFillPersonFill size="1.5em" /> Save Entry
          </button>
          <div className="mt-4 flex">
            <SyncToggle
              isSynced={isSynced}
              label="Use Traits"
              className="flex-1"
              value={worldInfoEntry.use_wpp}
              onChange={(evt) => {
                socketApi?.editWorldInfoEntry({
                  ...worldInfoEntry,
                  use_wpp: evt.target.checked,
                });
                dispatch(
                  updateLocalSequenceNumber({
                    key: "story_worldinfo",
                    sequenceNumber: sequenceNumber + 1,
                  })
                );
              }}
            />
            <div className="flex flex-1">
              <div className="w-full mb-4">
                <div className="mb-2">
                  <span className="text-sm">Format</span>
                </div>
                <select
                  className="select select-bordered bg-base-200 select-sm w-full max-w-full"
                  value={worldInfoEntry.wpp.format}
                  onChange={(evt) => {
                    socketApi?.editWorldInfoEntry({
                      ...worldInfoEntry,
                      wpp: {
                        ...worldInfoEntry.wpp,
                        format: evt.target.value as WPPFormat,
                      },
                    });
                    dispatch(
                      updateLocalSequenceNumber({
                        key: "story_worldinfo",
                        sequenceNumber: sequenceNumber + 1,
                      })
                    );
                  }}
                >
                  <option value="W++">W++</option>
                  <option value="Square Bracket Format (SBF)">SBF</option>
                </select>
              </div>
            </div>
          </div>

          {worldInfoEntry.type === "wi" && (
            <div className="space-y-4 py-2">
              <SyncInput
                label="Primary Keywords (Comma Separated)"
                value={worldInfoEntry.key.join(",")}
                isSynced={isSynced}
                onChange={(evt) => {
                  socketApi?.editWorldInfoEntry({
                    ...worldInfoEntry,
                    key: evt.target.value.split(","),
                  });
                  dispatch(
                    updateLocalSequenceNumber({
                      key: "story_worldinfo",
                      sequenceNumber: sequenceNumber + 1,
                    })
                  );
                }}
              />
              <SyncInput
                label="Secondary Keywords (Comma Separated)"
                value={worldInfoEntry.keysecondary.join(",")}
                isSynced={isSynced}
                onChange={(evt) => {
                  socketApi?.editWorldInfoEntry({
                    ...worldInfoEntry,
                    keysecondary: evt.target.value.split(","),
                  });
                  dispatch(
                    updateLocalSequenceNumber({
                      key: "story_worldinfo",
                      sequenceNumber: sequenceNumber + 1,
                    })
                  );
                }}
              />
            </div>
          )}
          {!worldInfoEntry.use_wpp && (
            <>
              <SyncTextarea
                value={worldInfoEntry.manual_text}
                disabled={worldInfoEntry.use_wpp}
                isSynced={isSynced}
                onChange={(evt) => {
                  socketApi?.editWorldInfoEntry({
                    ...worldInfoEntry,
                    manual_text: evt.target.value,
                  });
                  dispatch(
                    updateLocalSequenceNumber({
                      key: "story_worldinfo",
                      sequenceNumber: sequenceNumber + 1,
                    })
                  );
                }}
                label="Text"
              />
              <div className="flex space-y-4 mb-2 flex-wrap">
                <button
                  onClick={() => {
                    dispatch(setIsLoadingWi(true));
                    socketApi?.generateWI(worldInfoEntry);
                  }}
                  className="btn btn-sm btn-neutral w-full flex-grow"
                  disabled={isGeneratingWI}
                >
                  {isGeneratingWI ? (
                    <span className="loading loading-spinner loading-md" />
                  ) : (
                    <>
                      <FaRobot size="1.5em" /> Generate Text
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    dispatch(
                      openModal({
                        name: "loadFromLibrary",
                        data: {
                          fileType: "text",
                          target: `wi-${worldInfoEntry.uid}`,
                        },
                      })
                    );
                  }}
                  className="btn btn-sm btn-neutral w-full flex-grow"
                >
                  <BiNotepad size="1.5em" /> Load Text
                </button>
                <button
                  onClick={() => {
                    dispatch(
                      openModal({
                        name: "saveToLibrary",
                        data: {
                          fileType: "text",
                          content: worldInfoEntry.manual_text,
                        },
                      })
                    );
                  }}
                  className="btn btn-sm btn-neutral w-full flex-grow"
                >
                  <BiNotepad size="1.5em" /> Save Text
                </button>
              </div>
            </>
          )}
          {worldInfoEntry.use_wpp && (
            <>
              <button
                onClick={() => {
                  socketApi?.editWorldInfoEntry({
                    ...worldInfoEntry,
                    manual_text: `${worldInfoEntry.content}

${worldInfoEntry.manual_text}`,
                    use_wpp: false,
                  });
                  dispatch(
                    updateLocalSequenceNumber({
                      key: "story_worldinfo",
                      sequenceNumber: sequenceNumber + 1,
                    })
                  );
                }}
                disabled={!worldInfoEntry.use_wpp}
                className="btn btn-sm btn-neutral w-full mb-4"
              >
                Insert Traits In Text
              </button>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => {
                    dispatch(
                      openModal({
                        name: "loadFromLibrary",
                        data: {
                          fileType: "wi",
                          target: `wi-${worldInfoEntry.uid}`,
                        },
                      })
                    );
                  }}
                  className="btn btn-sm btn-neutral flex-1"
                >
                  <PiBracketsCurlyBold size="1.5em" /> Load Traits
                </button>
              </div>
              <WPPEditor
                sequenceNumber={sequenceNumber}
                isSynced={isSynced}
                value={worldInfoEntry.wpp.attributes}
                worldInfoEntry={worldInfoEntry}
              />
            </>
          )}

          <SyncTextarea
            value={worldInfoEntry.comment}
            isSynced={isSynced}
            onChange={(evt) => {
              socketApi?.editWorldInfoEntry({
                ...worldInfoEntry,
                comment: evt.target.value,
              });
              dispatch(
                updateLocalSequenceNumber({
                  key: "story_worldinfo",
                  sequenceNumber: sequenceNumber + 1,
                })
              );
            }}
            label="Comment"
          />
        </div>
      )}
    </li>
  );
};
