import { Socket } from "socket.io-client";

export const submit = (text: string, socket?: Socket) => {
  socket?.emit("submit", {
    data: text,
    theme: "",
  });
};
