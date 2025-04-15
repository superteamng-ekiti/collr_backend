import mongoose, { Schema } from "mongoose";

export type category =
  | "lifestyle"
  | "beauty"
  | "fashion"
  | "beauty"
  | "travel"
  | "health_fitness"
  | "food_drinks"
  | "art_photography"
  | "model"
  | "comedy_entertainment"
  | "music_dance";

interface IUser {
  auth_id: string;
  wallet_address: string;
  email: string;
  location: string;
  profile_description: string;
  gender: "m" | "f" | "o";
  connected_account: "tiktok" | "instagram" | "x" | "youtube";
  categories: category[];
  is_account_connected: {
    tiktok: IConnectAccount;
    instagram: IConnectAccount;
    x: IConnectAccount;
    youtube: IConnectAccount;
  };
  preview_videos: string[];
}

interface IConnectAccount {
  is_connected: boolean;
  username: string | undefined;
  followers: string | undefined;
}

const ConnectAccountSchema = new Schema<IConnectAccount>(
  {
    is_connected: { type: Boolean, default: false },
    username: { type: String, default: undefined },
    followers: { type: String, default: undefined }
  },
  { _id: false } // prevents nested _id fields
);

const UserSchema: Schema<IUser> = new mongoose.Schema({
  auth_id: String,
  wallet_address: String,
  email: {
    type: String,
    required: [true, "provide email"],
    unique: true
  },
  location: String,
  profile_description: String,
  gender: {
    type: String,
    required: [true, "provide gender"]
  },
  connected_account: {
    type: String
  },
  categories: [String],
  preview_videos: [String],
  is_account_connected: {
    tiktok: { type: ConnectAccountSchema, default: () => ({}) },
    instagram: { type: ConnectAccountSchema, default: () => ({}) },
    x: { type: ConnectAccountSchema, default: () => ({}) },
    youtube: { type: ConnectAccountSchema, default: () => ({}) }
  }
});

export default mongoose.model<IUser>("collruser", UserSchema);
