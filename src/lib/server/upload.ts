import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureCloudinary() {
  if (configured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET,
  });

  configured = true;
}

export async function uploadToCloudinary(
  buffer: string,
  publicId?: string | null
) {
  ensureCloudinary();

  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }

  const cloud = await cloudinary.uploader.upload(buffer);
  return {
    url: cloud.secure_url,
    public_id: cloud.public_id,
  };
}

export async function destroyCloudinary(publicId?: string | null) {
  if (!publicId) return;
  ensureCloudinary();
  await cloudinary.uploader.destroy(publicId);
}

export function cloudinaryPublicId(url: string) {
  const match = url.match(
    /\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.pdf)?(?:\?|$)/i
  );
  return match?.[1];
}

export function resumeDownloadUrl(publicId: string) {
  ensureCloudinary();
  return cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "image",
    type: "upload",
    attachment: false,
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });
}
