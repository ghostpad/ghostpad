import { Socket } from "socket.io-client";

export const useOptionText = (chunk: number | null, option: number, socket?: Socket) => {
  socket?.emit("Use Option Text", {
    chunk,
    option,
  });
};
