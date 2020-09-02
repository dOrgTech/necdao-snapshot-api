import express, { Application } from "express";
import { session, initialize, use } from "passport";
import "dotenv/config";
import "node-fetch";

import { controllers } from "./controllers";
import { errorHandler } from "./middlewares/errorHandler";
import { ScheduledJob } from "./utils/scheduler";

import JWTStrategy from "./middlewares/checkAuth";
import localStrategy from "./controllers/localStrategy";

const app: Application = express();

const requestHeaders = (
  _: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

const toUse = [express.json(), requestHeaders, initialize(), session()];

ScheduledJob.getInstance();

toUse.forEach((object) => app.use(object));
app.use("/", controllers);
use(localStrategy)
use(JWTStrategy)
app.use(errorHandler);

export default app;
