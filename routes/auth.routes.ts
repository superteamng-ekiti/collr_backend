import { Router } from "express";
import {
  auth_controller,
  authenticated,
  fetch_user_controller
} from "../controllers/auth.ts";
import { update_profile_controller } from "../controllers/update.ts";
import { auth_tiktok, get_tiktok_access_token } from "../controllers/tiktok.ts";

const auth_router = Router();

auth_router.post("/", auth_controller);
auth_router.get("/fetch/:email", fetch_user_controller);
auth_router.put("/update-profile", authenticated, update_profile_controller);
auth_router.get("/tiktok", auth_tiktok);
auth_router.post("/tiktok-access", get_tiktok_access_token);

export { auth_router };
