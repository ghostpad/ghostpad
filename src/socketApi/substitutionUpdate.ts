import { Substitution } from "@/types/KoboldConfig";
import { Socket } from "socket.io-client";

export const substitutionUpdate = (substitutions: Substitution[], socket?: Socket) => {
  socket?.emit("substitution_update", substitutions);
};
