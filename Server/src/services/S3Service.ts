import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (file: Express.Multer.File, userId: string) => {
  const key = `${userId}/${Date.now()}-${file.originalname}`;
  const params = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(params);
  return key;
};

export const getFileUrl = async (key: string) => {
  const params = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, params, { expiresIn: 3600 });
  return url;
};

export const deleteFile = async (key: string) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
};
