import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaRow } from "@/lib/db/schema";

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const r2Configured = Boolean(accountId && bucket && accessKeyId && secretAccessKey);

/** The bucket is private: no r2.dev URL, no custom domain, no public policy. */
const client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  : null;

function must(): S3Client {
  if (!client) throw new Error("R2 is not configured (need R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  return client;
}

/** 60s by default: long enough for the browser to follow one redirect. */
export function presign(key: string, seconds = 60): Promise<string> {
  return getSignedUrl(must(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
}

export async function getObject(key: string) {
  const res = await must().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!res.Body) throw new Error(`R2 object has no body: ${key}`);
  return {
    body: res.Body.transformToWebStream(),
    mime: res.ContentType ?? "application/octet-stream",
    bytes: res.ContentLength ?? 0,
  };
}

export async function putObject(key: string, body: Buffer, mime: string): Promise<void> {
  await must().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: mime }));
}

export interface VariantGroup {
  original: MediaRow;
  webp?: MediaRow;
  avif?: MediaRow;
}

/** Originals in `ord` order, each with whatever derivatives exist. */
export function pickVariants(rows: MediaRow[]): VariantGroup[] {
  const originals = rows.filter((r) => r.variantOf === null).sort((a, b) => a.ord - b.ord);
  return originals.map((original) => {
    const kids = rows.filter((r) => r.variantOf === original.id);
    return {
      original,
      webp: kids.find((k) => k.mime === "image/webp"),
      avif: kids.find((k) => k.mime === "image/avif"),
    };
  });
}
