import { Router } from "express";
import { scrape_tiktok } from "../controllers/tiktok.ts";
const scrape_router = Router();

scrape_router.post("/scrape-tiktok/:username", scrape_tiktok);

export { scrape_router };
