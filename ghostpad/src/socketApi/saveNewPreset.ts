import { Socket } from "socket.io-client";

export const saveNewPreset = (
  presetName: string,
  presetDescription: string,
  socket?: Socket
) => {
  socket?.emit("save_new_preset", {
    preset: presetName,
    description: presetDescription,
  });
};
