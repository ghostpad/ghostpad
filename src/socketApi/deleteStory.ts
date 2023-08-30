import { Socket } from "socket.io-client";

export const deleteStory = (storyPath: string | null, socket?: Socket) => {
  socket?.emit("popup_delete", storyPath);
};