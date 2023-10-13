import { Model } from "@/types/Model";
import { Socket } from "socket.io-client";

export const resubmitModelInfo = (selection: Model, socket?: Socket) => {
  socket?.emit("resubmit_model_info", selection);
};
