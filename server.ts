import express, { Request, Response } from "express";
import cors from "cors";
import { MONGO_URI, PORT } from "./utils/environment.ts";
import { log } from "./utils/globals.ts";
import { connect } from "./utils/database.ts";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*"
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "yayy 😌 you hit the home route",
    response: "/ service up and running"
  });
  return;
});

app.all("/*", (req: Request, res: Response) => {
  res.status(404).json({
    message: "looks like you hit a wrong endpoint",
    response: "route doesnt exist"
  });
  return;
});

app.listen(PORT, async () => {
  log("SERVER STARTED");
  log("===== CONNECTING TO MONGODB =====");
  await connect(MONGO_URI);
});
