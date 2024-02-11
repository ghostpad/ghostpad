import { Socket } from "socket.io-client";

export const setSelectedText = (
  id: number,
  text: string,
  sequenceNumber: number,
  socket?: Socket
) => {
  socket?.emit("Set Selected Text", {
    text,
    id,
    sequence_number: sequenceNumber,
  });
};
