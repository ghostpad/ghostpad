import { Socket } from "socket.io-client";

export const uploadWorldInfoFolder = (
  folder: string,
  filename: string,
  data: string | ArrayBuffer,
  socket?: Socket
) => {
  socket?.emit("upload_world_info_folder", { folder, filename, data });
};
