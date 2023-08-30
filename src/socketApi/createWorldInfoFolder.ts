import { Socket } from "socket.io-client";

export const createWorldInfoFolder = (socket?: Socket) => {
  socket?.emit("create_world_info_folder", {});
};
