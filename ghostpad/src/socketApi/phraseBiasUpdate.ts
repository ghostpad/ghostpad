import { RemoteBiases } from "@/util/biases";
import { Socket } from "socket.io-client";

export const phraseBiasUpdate = (
  biases: RemoteBiases,
  sequenceNumber: number,
  socket?: Socket
) => {
  socket?.emit("phrase_bias_update", {
    biases,
    sequence_number: sequenceNumber,
  });
};
