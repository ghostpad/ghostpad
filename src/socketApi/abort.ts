import { Socket } from "socket.io-client";

export const abort = (socket?: Socket) => {
  socket?.emit("abort", {});
};
