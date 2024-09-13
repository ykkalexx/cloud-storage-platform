import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { Readable } from "stream";

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

export const reassembleFile = async (
  fileKey: string,
  totalChunks: number
): Promise<number> => {
  let reassembledFile = Buffer.alloc(0);

  for (let i = 0; i < totalChunks; i++) {
    const chunkKey = `${fileKey}/chunk-${i}`;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: chunkKey,
    });

    console.log(`Fetching chunk ${i} from S3 with key ${chunkKey}`);

    const response = await s3Client.send(command);
    const chunkBuffer = await streamToBuffer(response.Body as Readable);

    reassembledFile = Buffer.concat([reassembledFile, chunkBuffer]);

    // Delete the chunk after reassembly
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: chunkKey,
      })
    );
  }

  // Upload the reassembled file
  await uploadFile(
    {
      buffer: reassembledFile,
      originalname: fileKey.split("/").pop()!,
    } as Express.Multer.File,
    fileKey.split("/")[0]
  );

  return reassembledFile.length;
};

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
  });
};

export const uploadFileChunk = async (
  chunk: Buffer,
  fileName: string,
  chunkIndex: number,
  userId: string
) => {
  if (!chunk || !Buffer.isBuffer(chunk)) {
    throw new Error("Invalid chunk provided");
  }

  const key = `${userId}/${fileName}/chunk-${chunkIndex}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: chunk,
  };

  await s3Client.send(new PutObjectCommand(params));
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
