import { type Request, type Response } from "express";
import axios from "axios";
import { scrape_tiktok_profile } from "../core/tiktok.ts";
import UserSchema from "../schema/Schema.ts";
import crypto from "crypto";
import { CLIENT_KEY, TIKTOK_SECRET } from "../utils/environment.ts";

const SERVER_ENDPOINT_REDIRECT =
  "https://f1c4-102-89-83-74.ngrok-free.app/profile";
// || "https://collr.vercel.app";

const scrape_tiktok = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { email } = req.body;
    if (!username) {
      res.status(409).json({
        response: "something went wrong trying to register you",
        message: "please provide url in params"
      });
    }

    const tiktok_data = await scrape_tiktok_profile(
      `https://www.tiktok.com/@${username}`
    );
    const existing_user = await UserSchema.findOne({ email });

    if (existing_user) {
      const updated_user = await UserSchema.findByIdAndUpdate(
        existing_user.id,
        {
          profile_description: tiktok_data.bio,
          "is_account_connected.tiktok.followers": tiktok_data.followers,
          "is_account_connected.tiktok.is_conected": false,
          "is_account_connected.tiktok.username": username
        },
        { new: true }
      );

      res.status(200).json({
        response: updated_user,
        message: "that went well.. 🙂"
      });

      return;
    } else {
      res.status(409).json({
        response: "something went wrong trying to find you",
        message: "please try registering"
      });
      return;
    }
  } catch (error) {
    res.status(409).json({
      response: "something went wrong " + error,
      message: "something went wrong trying to fetch your tiktok profile"
    });
  }
};

const scrape_tiktok_videos = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(409).json({
        message: "Missing email in body",
        response: "Missing email in body"
      });
      return;
    }

    const existing_user = await UserSchema.findOne({ email });

    if (!existing_user) {
      res.status(409).json({
        response: "something went wrong trying to find you",
        message: "please try registering"
      });
      return;
    }
    // Step 1: Fetch profile to extract secUid
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link",

      {
        max_count: 20
      },
      {
        headers: {
          Authorization: `Bearer ${existing_user.is_account_connected.tiktok.access_token}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      response: response.data.data,
      message: "that went well... 😅"
    });
    return;
  } catch (err) {
    console.error("TikTok scrape error:", err.message);
    res.status(500).json({
      message: "Something went wrong while scraping TikTok profile",
      error: err.message
    });
    return;
  }
};

const auth_tiktok = async (req: Request, res: Response) => {
  try {
    const CLIENT_KEY_ = CLIENT_KEY;

    const csrfState = Math.random().toString(36).substring(2);
    res.cookie("csrfState", csrfState, { maxAge: 60000 });

    const codeVerifier = crypto.randomBytes(32).toString("base64url");

    // Step 2: Create a code_challenge using SHA256
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest()
      .toString("base64url");

    // Step 3: Store code_verifier securely (e.g. in a cookie)
    res.cookie("codeVerifier", codeVerifier, { maxAge: 60000 });

    // the following params need to be in `application/x-www-form-urlencoded` format.
    let url = "https://www.tiktok.com/v2/auth/authorize/";
    url += `?client_key=${CLIENT_KEY_}`;
    url += "&scope=user.info.basic,video.list";
    url += "&response_type=code";
    url += `&redirect_uri=${SERVER_ENDPOINT_REDIRECT}`;
    url += `&state=${csrfState}`;
    url += "&code_challenge_method=S256";
    url += `&code_challenge=${codeChallenge}`;

    res.redirect(url);
  } catch (error) {
    res.status(409).json({
      response: "something went wrong " + error,
      message: "something went wrong trying to fetch your tiktok profile"
    });
  }
};

const get_tiktok_access_token = async (req: Request, res: Response) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      res.status(409).json({
        response: "please provide auth code and email in body",
        message: "something went wrong with that request"
      });
    }

    let response = await axios.post<IAccessResponse>(
      "https://open.tiktokapis.com/v2/oauth/token/",
      new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: TIKTOK_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: SERVER_ENDPOINT_REDIRECT
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache"
        }
      }
    );

    if (response.data.access_token) {
      await UserSchema.findOneAndUpdate(
        { email },
        {
          "is_account_connected.tiktok.is_connected": true,
          "is_account_connected.tiktok.access_token": response.data.access_token
        }
      );

      res.status(200).json({
        response: "that went well.. 🙂",
        message: "that went well.. 🙂"
      });
      return;
    } else {
      res.status(409).json({
        response: response.data,
        message: "something went wrong trying to fetch your tiktok profile"
      });
      return;
    }
  } catch (error) {
    res.status(409).json({
      response: "something went wrong " + error,
      message: "something went wrong trying to fetch your tiktok profile"
    });
    return;
  }
};

export {
  scrape_tiktok,
  scrape_tiktok_videos,
  auth_tiktok,
  get_tiktok_access_token
};

interface IAccessResponse {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface IAccessError {
  error: string;
  error_description: string;
  log_id: string;
}

// video.list

// url += "&scope=user.info.basic";

// ttAZTOsFwxxemDUAs2ilyyW9bM1Q5OhxGse1aeIDShZ7MBIxvJR7_kY-AFq_w0hpoxAe9mf-6-hNKqMgCNmvwirvT_FIA7Z0bKL5Dukz0KU1AVyfECr9nx-btZfY60OGbVqN0u8O5Vbqz7dWz72EhW8jzn5CTBBM4gStU7r9W28%2A3%215701.va
