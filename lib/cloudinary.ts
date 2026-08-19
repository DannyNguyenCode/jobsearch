import { v2 as cloudinary } from "cloudinary";

function client() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return cloudinary;
}

export async function pingCloudinary() {
  const result = await client().api.ping();
  if (result?.status !== "ok") {
    throw new Error("Cloudinary ping failed.");
  }
  return { ok: true as const };
}

export async function uploadApplicationAsset(input: {
  buffer: Buffer;
  folder: string;
  publicId: string;
  filename: string;
}) {
  const cloud = client();
  return new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
    original_filename?: string;
  }>((resolve, reject) => {
    const stream = cloud.uploader.upload_stream(
      {
        folder: input.folder,
        public_id: input.publicId,
        resource_type: "auto",
        overwrite: true,
        invalidate: true,
        use_filename: true,
        unique_filename: false,
        filename_override: input.filename,
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary did not return a file URL."));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type ?? "raw",
          bytes: result.bytes ?? input.buffer.length,
          original_filename: result.original_filename,
        });
      },
    );
    stream.end(input.buffer);
  });
}

export async function destroyApplicationAsset(publicId: string, resourceType = "raw") {
  if (!publicId) return;
  try {
    const cloud = client();
    try {
      await cloud.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
    } catch {
      try {
        await cloud.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
      } catch {
        await cloud.uploader.destroy(publicId, { resource_type: "raw", invalidate: true });
      }
    }
  } catch {
    // Leave an orphan in Cloudinary rather than blocking the applicant.
  }
}
