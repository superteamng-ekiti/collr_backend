import express, { type Request, type Response } from "express";
import User from "../schema/Schema.ts";

const update_profile_controller = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const query = req.query;

    const updateFields: any = {};

    // Handle known fields
    if (query.categories) {
      console.log(query.categories);
      updateFields.categories = Array.isArray(query.categories)
        ? query.categories
        : String(query.categories).split(",");
    }

    if (query.previewVideos) {
      updateFields.preview_videos = Array.isArray(query.previewVideos)
        ? query.previewVideos
        : String(query.previewVideos).split(",");
    }

    if (query.location) updateFields.location = query.location;
    if (query.bio) updateFields.profile_description = query.bio;
    // if (query.links) {
    //   try {
    //     updateFields.links = JSON.parse(query.links as string);
    //   } catch (e) {
    //     res
    //       .status(400)
    //       .json({ message: "Invalid links format. Must be JSON stringified." });
    //     return;
    //   }
    // }

    // Any additional keys in the query
    const allowedKeys = [
      "categories",
      "location",
      "bio",
      //   "links",
      "previewVideos"
    ];
    Object.keys(query).forEach((key) => {
      if (!allowedKeys.includes(key)) {
        updateFields[key] = query[key];
      }
    });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      res.status(409).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
    return;
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Something went wrong", error: err });
    return;
  }
};

export { update_profile_controller };
