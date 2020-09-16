import express, { Application } from "express";
import {
  session,
  initialize,
  use,
  serializeUser,
  deserializeUser,
} from "passport";
import "dotenv/config";
import "node-fetch";
import cors from 'cors';

import { controllers } from "./controllers";
import { ScheduledJob } from "./utils/scheduler";

import JWTStrategy from "./middlewares/checkAuth";
import localStrategy from "./controllers/localStrategy";
import { UserType } from "./models";

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

const toUse = [express.json(), cors({ origin: '*' }), requestHeaders, initialize(), session()];

ScheduledJob.getInstance();
const toggleSerializeUser = (user: UserType, done: Function) =>
  done(null, user);

serializeUser(toggleSerializeUser);
deserializeUser(toggleSerializeUser);

toUse.forEach((object) => app.use(object));
app.use("/", controllers);
use(localStrategy);
use(JWTStrategy);
//app.use(errorHandler);

export default app;
