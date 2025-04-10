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
  location: string;
  profile_description: string;
  gender: "m" | "f" | "o";
  connected_account: "tiktok" | "instagram" | "x" | "youtube";
  genre: category[];
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
  auth_id: string | undefined;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  auth_id: String,
  wallet_address: String,
  location: String,
  profile_description: String,
  gender: {
    type: String,
    required: [true, "provide gender"]
  },
  connected_account: {
    type: String
  },
  genre: [String],
  preview_videos: [String],
  is_account_connected: {
    default: {
      tiktok: { is_connected: false, username: undefined, auth_id: undefined },
      x: { is_connected: false, username: undefined, auth_id: undefined },
      youtube: { is_connected: false, username: undefined, auth_id: undefined },
      instagram: {
        is_connected: false,
        username: undefined,
        auth_id: undefined
      }
    }
  }
});

export default mongoose.model<IUser>("collruser", UserSchema);
