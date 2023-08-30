import { Socket } from "socket.io-client";

export const newStory = (socket?: Socket) => {
  socket?.emit("new_story", "");
};
