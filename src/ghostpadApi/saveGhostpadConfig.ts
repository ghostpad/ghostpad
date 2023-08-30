import { GhostpadConfig } from "@/store/configSlice";

export const saveGhostpadConfig = (configUpdate: Partial<GhostpadConfig>) => {
  return fetch("/api/updateConfig", {
    method: "POST",
    body: JSON.stringify({
      configUpdate,
    }),
  });
};
