import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

// Storage for Team Logos
const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hpl-2026/teams',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// Storage for Player Photos
const playerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hpl-2026/players',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fit' }],
  },
});

export const uploadTeamLogo = multer({ storage: teamStorage });
export const uploadPlayerPhoto = multer({ storage: playerStorage });
export { cloudinary };
