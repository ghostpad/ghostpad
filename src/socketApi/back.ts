import { Socket } from "socket.io-client";

export const back = (socket?: Socket) => {
  socket?.emit("back", {});
};
