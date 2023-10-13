import { Socket } from "socket.io-client";

export const removeUserscript = (scriptFilename: string, socket?: Socket) => {
  socket?.emit("unload_userscripts", scriptFilename);
};
