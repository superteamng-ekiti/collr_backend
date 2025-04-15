import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";

import cors from "cors";
import { MONGO_URI, PORT } from "./utils/environment.ts";
import { log } from "./utils/globals.ts";
import { connect } from "./utils/database.ts";
import { auth_router } from "./routes/auth.routes.ts";
import { scrape_router } from "./routes/scraper.routes.ts";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "*"
  })
);

app.use("/api", scrape_router);
app.use("/api/auth", auth_router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "yayy 😌 you hit the home route",
    response: "/ service up and running"
  });
  return;
});

app.all("/*any", (req: Request, res: Response) => {
  res.status(404).json({
    message: "looks like you hit a wrong endpoint",
    response: "route doesnt exist"
  });
  return;
});

app.listen(PORT, async () => {
  log("SERVER STARTED AT", PORT);
  log("===== CONNECTING TO MONGODB =====");
  await connect(MONGO_URI);
});
