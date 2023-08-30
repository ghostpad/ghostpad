import * as fs from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import {
  rootLibraryPath,
} from "@/fileApi/library";
import { sanitizeFilename } from "@/util/sanitizeFilename";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { filename, fileType} = JSON.parse(req.body);

    if (
      typeof filename !== "string" ||
      typeof fileType !== "string" ||
      !["wi", "text"].includes(fileType)
    ) {
      res.status(400).end();
      return;
    }

    const sanitizedFilename = sanitizeFilename(filename);

    const filePath = path.join(
      rootLibraryPath,
      fileType,
      `${sanitizedFilename}.${fileType === "wi" ? "json" : "txt"}`
    );


    if (!fs.existsSync(filePath)) {
      res.status(404).end()
      return;
    }

    fs.rmSync(filePath);
    res.status(200).end();
  } else {
    res.status(405).end();
  }
}
