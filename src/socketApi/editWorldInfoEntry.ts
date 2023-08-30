import { DraftWorldInfoEntry, WorldInfoEntry } from "@/types/WorldInfo";
import { createWIEntry } from "@/util/createWIEntry";
import { Socket } from "socket.io-client";

export const editWorldInfoEntry = (wiEntry: WorldInfoEntry | DraftWorldInfoEntry, socket?: Socket) => {
  socket?.emit("edit_world_info", wiEntry);
};

export const createWorldInfoEntry = (wiEntry: Partial<WorldInfoEntry>, socket?: Socket) => {
  const newWorldInfoEntry: DraftWorldInfoEntry = createWIEntry(wiEntry);
  editWorldInfoEntry(newWorldInfoEntry, socket);
}