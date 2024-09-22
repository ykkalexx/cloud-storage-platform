import File from "models/File";

export const searchFiles = async (
  userId: string,
  query: string,
  options: any = {}
) => {
  const { limit = 20, skip = 0 } = options;

  const regex = new RegExp(query, "i"); // "i" for case-insensitive

  const files = await File.find({
    userId,
    isFolder: false,
    $or: [{ name: regex }, { tags: regex }],
  })
    .skip(skip)
    .limit(limit)
    .lean();

  return files;
};
