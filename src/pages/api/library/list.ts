import * as fs from "fs";
import * as path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { rootLibraryPath } from "@/fileApi/library";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { fileType } = req.query;
    // Validate the type to limit the subdirectories that can be accessed
    if (typeof fileType !== "string" || !["wi", "text"].includes(fileType)) {
      res.status(400).end();
      return;
    }
    const libraryPath = path.join(rootLibraryPath, fileType);
    const items = fs
      .readdirSync(libraryPath)
      .filter((item) => {
        return fileType === "wi"
          ? item.endsWith(".json")
          : item.endsWith(".txt");
      })
      .map((item) => {
        const name = path.basename(item, path.extname(item));
        return {
          name,
          filename: item,
        };
      });
    res.status(200).json(items);
  } else {
    res.status(405).end();
  }
}
