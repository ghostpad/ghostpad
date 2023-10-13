import { Socket } from "socket.io-client";

export const deleteWorldInfoFolder = (folderName: string, socket?: Socket) => {
  socket?.emit("delete_wi_folder", folderName);
};
