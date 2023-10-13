import { Socket } from "socket.io-client";

export const addUserscript = (selectedUserscript: string | null, socket?: Socket) => {
  socket?.emit("load_userscripts", selectedUserscript);
};