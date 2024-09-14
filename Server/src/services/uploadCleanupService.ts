import IncompleteUpload from "models/IncompleteUpload";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./S3Service";

const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const cleanupIncompleteUploads = async () => {
  const threshold = new Date(Date.now() - CLEANUP_THRESHOLD);

  const incompleteUploads = await IncompleteUpload.find({
    lastUpdated: { $lt: threshold },
  });

  for (const upload of incompleteUploads) {
    await deleteIncompleteUpload(upload);
  }
};

const deleteIncompleteUpload = async (upload: any) => {
  const chunkKeys = upload.uploadedChunks.map((chunkIndex: number) => ({
    Key: `${upload.userId}/${upload.fileName}/chunk-${chunkIndex}`,
  }));

  if (chunkKeys.length > 0) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Delete: { Objects: chunkKeys },
    });

    await s3Client.send(deleteCommand);
  }

  await IncompleteUpload.findByIdAndDelete(upload._id);
};
