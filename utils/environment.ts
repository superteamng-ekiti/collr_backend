import dotenv from "dotenv";

dotenv.config();
const env = process.env;

const MONGO_URI = env.MONGO_URI || "";
const PORT = env.PORT || "";

export { MONGO_URI, PORT };
