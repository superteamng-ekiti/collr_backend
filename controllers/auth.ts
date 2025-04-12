import { type Request, type Response } from "express";
import UserSchema from "../schema/Schema.ts";

const auth_controller = async (req: Request, res: Response) => {
  try {
    const { email, gender } = req.body;
    if (!email) {
      res.status(409).json({
        response: "something went wrong trying to register you",
        message: "please provide email"
      });
    }

    const existing_user = await UserSchema.findOne({ email });

    if (existing_user) {
      res.status(200).json({
        response: existing_user,
        message: "that went well.. 🙂"
      });
      return;
    } else {
      const new_user = new UserSchema({
        email,
        gender
      });
      await new_user.save();
      res.status(200).json({
        response: "that went well.. 🙂",
        message: "successfully registered 🎊"
      });
      return;
    }
  } catch (error) {
    res.status(409).json({
      response: "something went wrong " + error,
      message: "something went wrong trying to register you"
    });
  }
};

const fetch_user_controller = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      res.status(409).json({
        response: "something went wrong trying to find you",
        message: "please provide email"
      });
    }

    const existing_user = await UserSchema.findOne({ email });

    if (existing_user) {
      res.status(200).json({
        response: existing_user,
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
      message: "something went wrong trying to find you"
    });
  }
};

export { auth_controller, fetch_user_controller };
