import { Router } from "express";
import {
  auth_controller,
  authenticated,
  fetch_user_controller
} from "../controllers/auth.ts";
import { update_profile_controller } from "../controllers/update.ts";

const auth_router = Router();

auth_router.post("/", auth_controller);
auth_router.get("/fetch/:email", fetch_user_controller);
auth_router.put("/update-profile", authenticated, update_profile_controller);

export { auth_router };
