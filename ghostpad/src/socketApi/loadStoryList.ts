import { Socket } from "socket.io-client";

export const loadStoryList = (socket?: Socket) => {
  socket?.emit("load_story_list", "");
};
