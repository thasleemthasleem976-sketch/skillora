import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Storage] Cloudinary initialized for remote media streaming.');
} else {
  console.log('[Storage] Cloudinary credentials not detected; using high-performance HTTP partial-content (206) video streaming with local storage.');
}

export { cloudinary, isConfigured as isCloudinaryConfigured };
