import * as fs from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { rootLibraryPath } from "@/fileApi/library";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { filename, fileType } = req.query;
    // Validate the type to limit the subdirectories that can be accessed
    if (
      typeof filename !== "string" ||
      typeof fileType !== "string" ||
      !["wi", "text"].includes(fileType)
    ) {
      res.status(400).end();
      return;
    }
    const filePath = path.join(rootLibraryPath, fileType, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    res
      .status(200)
      .json({
        fileContents:
          fileType === "wi" ? JSON.parse(fileContents) : fileContents,
      });
  }
}
