import { WorldInfoEntries } from "@/types/WorldInfo";
import { WorldInfoCard } from "./WorldInfoCard";

export const WorldInfoEntryList = ({
  uids,
  worldInfoEntries,
  folderName,
}: {
  uids: number[];
  worldInfoEntries: WorldInfoEntries;
  folderName: string;
}) => (
  <ul className="my-2 space-y-2">
    {uids?.length === 0 && folderName !== "root" && (
      <div className="p-4 pb-4 text-center">No entries.</div>
    )}
    {uids?.map((uid) => {
      const worldInfoEntry = worldInfoEntries[uid];
      return worldInfoEntry ? (
        <WorldInfoCard key={worldInfoEntry.uid} worldInfoEntry={worldInfoEntry} />
      ) : null;
    })}
  </ul>
);