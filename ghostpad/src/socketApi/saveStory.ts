import { Socket } from "socket.io-client";

export const saveStoryWithCallback = (
  callback: (response: string) => void,
  socket?: Socket
) => {
  socket?.emit("save_story", null, (response: string) => {
    callback(response);
  });
};

export const overwriteStory = (socket?: Socket) => {
  socket?.emit("save_story", "overwrite");
};
