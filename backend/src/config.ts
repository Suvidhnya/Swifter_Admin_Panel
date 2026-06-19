import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  override: process.env.NODE_ENV !== 'production'
});

export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345';
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swifter-admin';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
export const PORT = process.env.PORT || 5000;
