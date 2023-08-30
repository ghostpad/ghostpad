import * as R from "ramda";
import * as fs from "fs";
import {
  createConfigIfNotPresent,
  getConfigPaths,
  readGhostpadConfig,
} from "@/fileApi/config";
import { NextApiRequest, NextApiResponse } from "next";
import defaultGhostpadConfig from "@/fileApi/defaultGhostpadConfig";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { configUpdate } = JSON.parse(req.body);
    const ghostpadConfig = R.mergeDeepRight(
      defaultGhostpadConfig,
      readGhostpadConfig()
    );
    const updatedGhostpadConfig = R.mergeDeepRight(
      ghostpadConfig,
      configUpdate
    );
    createConfigIfNotPresent();
    const { configPath } = getConfigPaths();
    fs.writeFileSync(
      configPath,
      JSON.stringify(updatedGhostpadConfig, null, 2)
    );
    res.status(200).json(updatedGhostpadConfig);
  } else {
    res.status(405).end();
  }
}
