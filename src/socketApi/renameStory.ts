import { Socket } from "socket.io-client";

export const renameStory = (
  storyPath: string,
  newName: string,
  socket?: Socket
) => {
  socket?.emit("popup_rename_story", { file: storyPath, new_name: newName });
};
