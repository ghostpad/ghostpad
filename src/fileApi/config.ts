import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { GhostpadConfig } from "@/store/configSlice";
import defaultGhostpadConfig from "./defaultGhostpadConfig";

export const getConfigPaths = () => {
  const configDir = path.join(os.homedir(), "GhostPad");
  const configPath = path.join(configDir, "config.json");
  return { configDir, configPath };
};

export const createConfigIfNotPresent = () => {
  const { configDir, configPath } = getConfigPaths();
  // Check if the config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  // Create the file if it doesn't exist
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultGhostpadConfig, null, 2)
    );
  }
};

export const readGhostpadConfig: () => Partial<GhostpadConfig> = () => {
  createConfigIfNotPresent();
  const { configPath } = getConfigPaths();
  const config = fs.readFileSync(configPath, "utf8");
  return JSON.parse(config);
};
