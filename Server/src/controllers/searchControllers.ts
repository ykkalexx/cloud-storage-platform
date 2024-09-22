import { Request, Response } from "express";
import { searchFiles } from "../services/searchService";
import { IUser } from "models/User";

export const searchFilesController = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const user = req.user as IUser;
    const userId = user.id.toString();

    if (typeof query !== "string") {
      return res.status(400).json({ message: "Invalid search query" });
    }

    const files = await searchFiles(userId, query, {
      limit: 20,
      skip: 0,
    });

    res.json(files);
  } catch (error) {
    console.error("Error searching files:", error);
    res.status(500).json({ message: "Error searching files" });
  }
};
