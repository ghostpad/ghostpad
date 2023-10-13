import { RemoteBiases } from "@/components/modals/BiasingModal";
import { Socket } from "socket.io-client";

export const phraseBiasUpdate = (biases: RemoteBiases, socket?: Socket) => {
  socket?.emit("phrase_bias_update", biases);
};
