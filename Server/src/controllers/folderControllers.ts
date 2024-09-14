import { Request, Response } from "express";
import File from "models/File";
import { IUser } from "models/User";

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const user = req.user as IUser;
    const userId = user.id.toString();

    const newFolder = new File({
      name,
      key: `${userId}/${name}/`,
      size: 0,
      userId,
      isFolder: true,
      parent: parentId || null,
    });

    await newFolder.save();

    res
      .status(201)
      .json({ message: "Folder created successfully", folder: newFolder });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Error creating folder" });
  }
};

export const getContents = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.params;
    const user = req.user as IUser;
    const userId = user.id.toString();

    const contents = await File.find({
      userId,
      parent: folderId || null,
    }).sort({ isFolder: -1, name: 1 });

    res.json({ contents });
  } catch (error) {
    console.error("Error getting folder contents:", error);
    res.status(500).json({ message: "Error getting folder contents" });
  }
};
