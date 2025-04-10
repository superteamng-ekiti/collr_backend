import mongoose from "mongoose";
import { log } from "./globals.ts";

const connect = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    log("===== MONGODB CONNECTED =====");
  } catch (error) {
    log("MongoDB CONNECTION ERROR: ", error);
    process.exit(1);
  }
};

export { connect };
