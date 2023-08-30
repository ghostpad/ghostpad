import { Socket } from "socket.io-client";

export const loadUserscriptsList = (socket?: Socket) => {
  socket?.emit("load_userscripts_list", "");
};
