import dotenv from "dotenv";

dotenv.config();
const env = process.env;

const MONGO_URI = env.MONGO_URI || "";
const PORT = env.PORT || "";
const CLIENT_KEY = env.TIKTOK_CLIENT || "";
const TIKTOK_SECRET = env.TIKTOK_SECRET || "";

export { MONGO_URI, PORT, CLIENT_KEY, TIKTOK_SECRET };
