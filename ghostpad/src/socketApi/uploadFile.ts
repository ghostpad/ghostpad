import { Socket } from "socket.io-client";

export const uploadFile = (
  filename: string,
  data: string | ArrayBuffer,
  socket?: Socket
) => {
  socket?.emit("upload_file", { filename, data, upload_no_save: false });
};
