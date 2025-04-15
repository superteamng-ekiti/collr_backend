import { Router } from "express";
import { scrape_tiktok, scrape_tiktok_videos } from "../controllers/tiktok.ts";
const scrape_router = Router();

scrape_router.post("/scrape-tiktok/:username", scrape_tiktok);
scrape_router.post("/scrape-tiktok-video", scrape_tiktok_videos);

export { scrape_router };
