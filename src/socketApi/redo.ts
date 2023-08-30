import { Socket } from "socket.io-client";

export const redo = (socket?: Socket) => {
  socket?.emit("redo", {});
};
