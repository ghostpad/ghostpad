import { Socket } from "socket.io-client";

export const deleteWorldInfoEntry = (uid: number, socket?: Socket) => {
  socket?.emit("delete_world_info", uid);
};