import { Socket } from "socket.io-client";

export const loadStory = (path: string, socket?: Socket) => {
  socket?.emit("load_story", path);
};
