import { Socket } from "socket.io-client";

export const renameWorldInfoFolder = (oldFolder: string, newFolder: string, socket?: Socket) => {
  socket?.emit("Rename_World_Info_Folder", {
    old_folder: oldFolder,
    new_folder: newFolder,
  });
};
