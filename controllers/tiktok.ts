import { type Request, type Response } from "express";
import axios from "axios";
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

const scrape_tiktok_videos = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({
        message: "Missing TikTok username in params"
      });
      return;
    }

    // Step 1: Fetch profile to extract secUid
    const profileHTML = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const secUidMatch = profileHTML.data.match(/"secUid":"(.*?)"/);
    if (!secUidMatch || !secUidMatch[1]) {
      res.status(404).json({
        message: "Could not extract secUid from TikTok profile page"
      });
      return;
    }

    const secUid = secUidMatch[1];

    console.log(secUidMatch, secUid);

    // Step 2: Hit the item_list API with secUid
    const apiURL = `https://www.tiktok.com/api/post/item_list/?secUid=${secUid}&count=5&cursor=0&aid=1988`;

    const apiResponse = await axios.get(apiURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
        Referer: `https://www.tiktok.com/@${username}`
      }
    });

    console.log(apiResponse.data);

    const videos = apiResponse.data.itemList.map((item: any) => ({
      id: item.id,
      description: item.desc,
      cover: item.video.cover,
      video_url: item.video.playAddr,
      stats: item.stats
    }));

    res.status(200).json({
      username,
      count: videos.length,
      videos
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

const scrape_and_update_tiktok = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { email } = req.body;

    if (!username) {
      res.status(400).json({
        response: "Missing TikTok username in params",
        message: "please provide a username"
      });
      return;
    }

    const profileURL = `https://www.tiktok.com/@${username}`;
    const html = await axios.get(profileURL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.tiktok.com/",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      }
    });

    const rawJSON = html.data.match(
      /<script id="SIGI_STATE"[^>]*>(.*?)<\/script>/
    )?.[1];
    if (!rawJSON) {
      res.status(500).json({
        message: "Could not extract TikTok data from profile page"
      });
      return;
    }

    const data = JSON.parse(rawJSON);
    const user = data?.UserModule?.users?.[username];
    const items = data?.ItemList?.user?.[username]?.list || [];
    const itemDetails = data?.ItemModule || {};

    if (!user) {
      res.status(404).json({
        message: "User not found in extracted TikTok data"
      });
      return;
    }

    // Get the latest videos
    const videos = items.map((id: string) => {
      const item = itemDetails[id];
      return {
        id,
        description: item?.desc,
        cover: item?.video?.cover,
        video_url: item?.video?.playAddr,
        stats: item?.stats
      };
    });

    // Update or respond
    // const existing_user = await UserSchema.findOne({ email });

    // if (existing_user) {
    //   const updated_user = await UserSchema.findByIdAndUpdate(
    //     existing_user.id,
    //     {
    //       profile_description: user.signature,
    //       "is_account_connected.tiktok.followers": user.followers,
    //       "is_account_connected.tiktok.is_conected": true,
    //       "is_account_connected.tiktok.username": username
    //     },
    //     { new: true }
    //   );

    res.status(200).json({
      response: "updated_user",
      videos,
      message: "TikTok data scraped and user updated successfully"
    });
    return;
    // } else {
    //   res.status(404).json({
    //     response: null,
    //     message: "User not found in database, please register first"
    //   });
    //   return;
    // }
  } catch (error: any) {
    console.error("TikTok scrape error:", error.message);
    res.status(500).json({
      response: null,
      message: "Something went wrong while scraping TikTok",
      error: error.message
    });
    return;
  }
};

export { scrape_tiktok, scrape_tiktok_videos, scrape_and_update_tiktok };
