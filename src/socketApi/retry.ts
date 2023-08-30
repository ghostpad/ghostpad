import { Socket } from "socket.io-client";

export const retry = (socket?: Socket) => {
  socket?.emit("retry", {});
};
