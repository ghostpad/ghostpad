import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const rootLibraryPath = path.join(os.homedir(), "GhostPad", "Library");

export const createLibraryDirsIfNotPresent = (type: string) => {
  const libraryPath = path.join(rootLibraryPath, type);
  if (!fs.existsSync(libraryPath)) {
    fs.mkdirSync(libraryPath, { recursive: true });
  }
};