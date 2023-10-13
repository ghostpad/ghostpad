import { Socket } from "socket.io-client";

export const moveWorldInfoEntry = (
  uid: number,
  folderName: string,
  socket?: Socket
) => {
  socket?.emit("wi_set_folder", {
    dragged_id: uid.toString(),
    folder: folderName,
  });
};
