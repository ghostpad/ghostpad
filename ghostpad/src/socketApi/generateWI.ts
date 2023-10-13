import { WorldInfoEntry } from "@/types/WorldInfo";
import { Socket } from "socket.io-client";

export type GenerateWIParams = {
  existing: {
    desc: string | null;
    title: string;
    type: string | null;
  };
  field: string;
  genAmount: number;
  uid: number;
};

export const generateWI = (entry: WorldInfoEntry, socket?: Socket) => {
  const generationParams: GenerateWIParams = {
    existing: {
      desc: null,
      title: entry.title,
      type: entry.object_type,
    },
    field: "desc",
    genAmount: 50,
    uid: entry.uid,
  };
  socket?.emit("generate_wi", generationParams);
};
