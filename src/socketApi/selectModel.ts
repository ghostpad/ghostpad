import { Model } from "@/types/Model";
import { Socket } from "socket.io-client";

export const selectModel = (selection: Model, socket?: Socket) => {
  socket?.emit("select_model", selection);
};
