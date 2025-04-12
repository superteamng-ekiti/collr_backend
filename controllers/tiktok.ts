import { type Request, type Response } from "express";
import { scrape_tiktok_profile } from "../core/tiktok.ts";
import UserSchema from "../schema/Schema.ts";

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
          "is_account_connected.tiktok.is_conected": true,
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

export { scrape_tiktok };
