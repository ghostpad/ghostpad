import { Socket } from "socket.io-client";

export const setSelectedText = (id: number, text: string, socket?: Socket) => {
  socket?.emit("Set Selected Text", {
    text,
    id,
  });
};
