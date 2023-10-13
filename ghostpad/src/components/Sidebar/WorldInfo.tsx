import { RootState } from "@/store/store";
import { useContext, useMemo } from "react";
import { AiFillFolderAdd } from "react-icons/ai";
import { shallowEqual, useSelector } from "react-redux";
import { SocketApiContext } from "@/socketApi/SocketApiProvider";
import { VarRange } from "@/components/Forms/VarRange";
import { VarToggle } from "@/components/Forms/VarToggle";
import { WorldInfoFolder } from "./WorldInfo/WorldInfoFolder";

export const WorldInfo = () => {
  const { wiFolderInfo, wiFolderIds } = useSelector(
    (state: RootState) => ({
      wiFolderInfo: state.config.koboldConfig.story?.wifolders_d,
      wiFolderIds: state.config.koboldConfig.story?.wifolders_l,
    }),
    shallowEqual
  );
  const { worldInfoFolders, worldInfoEntries } = useSelector(
    (state: RootState) => state.worldInfo
  );
  const socketApi = useContext(SocketApiContext);
  const folderNames = useMemo(
    () => Object.keys(worldInfoFolders),
    [worldInfoFolders]
  );
  const entryCount = useMemo(
    () => Object.keys(worldInfoEntries).length,
    [worldInfoEntries]
  );
  return (
    <div className="px-6 py-3">
      <h2 className="px-6 pb-3 font-bold text-center">World Info</h2>

      <div className="collapse collapse-arrow border border-neutral bg-base-200 rounded-box mb-3">
        <input type="checkbox" />
        <div className="collapse-title h-8">
          <span className="text-sm">World Info Settings</span>
        </div>
        <div className="collapse-content flex flex-row flex-wrap justify-center gp-range-group">
          <VarRange
            label="WI Depth"
            varName="user_widepth"
            min={1}
            max={5}
            step={1}
            title="Number of actions from the end of the story to scan for World Info keys."
          />
          <VarToggle
            label="Dynamic WI Scan"
            varName="story_dynamicscan"
            title="Scans the AI's output for World Info keys as it is generating one."
          />
          <VarRange
            label="WI Gen Amount"
            varName="user_wigen_amount"
            min={25}
            max={125}
            step={1}
            title="How many tokens the World Info Generator creates."
          />
          <VarToggle
            label="Native WI Gen"
            varName="user_wigen_use_own_wi"
            title="Uses your existing applicable (has title,type,content) World Info entries as inspiration for generated ones."
          />
          <VarRange
            label="Story Commentary Chance"
            varName="story_commentary_chance"
            min={0}
            max={100}
            step={1}
            title="Chance that the AI will add commentary to the story."
          />
          <VarToggle
            label="Story Commentary Enabled"
            varName="story_commentary_enabled"
            title="Allow custom characters to comment on the story."
          />
        </div>
      </div>

      <div className="flex px-4 mb-3 space-x-2">
        <button
          onClick={() => {
            socketApi?.createWorldInfoFolder();
          }}
          className="btn btn-sm btn-primary flex-1"
          title="Create a folder to group world info entries."
        >
          <AiFillFolderAdd size="1.5em" /> New Folder
        </button>
      </div>
      {entryCount === 0 && folderNames.length === 1 && (
        <div className="p-4 pb-4 text-center">No entries.</div>
      )}
      {[-1, ...(wiFolderIds || [])].map((folderUid) => {
        const folderName =
          folderUid === -1 ? "root" : wiFolderInfo?.[folderUid]?.name;
        if (typeof folderName !== "string") {
          return null;
        }
        return (
          <div className="pb-4" key={folderName === "root" ? "-1" : folderUid}>
            <WorldInfoFolder
              folderUid={`${folderUid}`}
              folderName={folderName}
              uids={worldInfoFolders[folderName]}
              worldInfoEntries={worldInfoEntries}
            />
          </div>
        );
      })}
    </div>
  );
};
