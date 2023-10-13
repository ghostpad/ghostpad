import { GhostpadConfig } from "@/store/configSlice";

export const saveGhostpadConfig = (configUpdate: Partial<GhostpadConfig>) => {
  return fetch("/ghostpad/api/update_config", {
    method: "POST",
    body: JSON.stringify({
      configUpdate,
    }),
  });
};
