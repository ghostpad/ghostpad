import { Model } from "@/types/Model";
import { Socket } from "socket.io-client";

export const loadModel = (model: Model, socket?: Socket) => {
  socket?.emit("load_model", model);
};
