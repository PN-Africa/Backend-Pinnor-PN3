
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase.js";

const BUCKET_NAME = "provider-images";

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export const uploadProviderImageToStorage = async (file, providerId) => {
  if (!file || !file.buffer || !file.mimetype) {
    throw new Error("A valid provider image is required");
  }

  const extension = extensions[file.mimetype];

  if (!extension) {
    const error = new Error("Unsupported image format");
    error.statusCode = 400;
    throw error;
  }

  const filePath = `${providerId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    imageUrl: data.publicUrl,
    imagePath: filePath
  };
};
