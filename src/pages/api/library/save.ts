import * as fs from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import {
  createLibraryDirsIfNotPresent,
  rootLibraryPath,
} from "@/fileApi/library";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { filename, content, fileType, overwrite } = JSON.parse(req.body);

    if (
      typeof filename !== "string" ||
      typeof fileType !== "string" ||
      !["wi", "text"].includes(fileType)
    ) {
      res.status(400).end();
      return;
    }

    createLibraryDirsIfNotPresent(fileType);

    const filePath = path.join(
      rootLibraryPath,
      fileType,
      `${filename}.${fileType === "wi" ? "json" : "txt"}`
    );

    if (fs.existsSync(filePath) && !overwrite) {
      res.status(409).end();
      return;
    }

    fs.writeFileSync(filePath, content);
    res.status(200).end();
  } else {
    res.status(405).end();
  }
}
