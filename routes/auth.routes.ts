import { Router } from "express";
import { auth_controller, fetch_user_controller } from "../controllers/auth.ts";

const auth_router = Router();

auth_router.post("/", auth_controller);
auth_router.get("/fetch/:email", fetch_user_controller);

export { auth_router };
