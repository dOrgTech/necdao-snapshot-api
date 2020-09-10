import { Router, Request, Response, NextFunction } from "express";

import dayjs, { actualWeekNumber } from "../utils/day";
import { takeSnapshot } from "../services/snapshot";
import { tokenVerify } from "../middlewares/tokenVerify";
import { Week } from "../models";

const router = Router();

const takeSnapshotNow = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const snapshotTaken = await takeSnapshot();
    if (!snapshotTaken) {
      res.send({
        status: 403,
        message: "Snapshot already taken this week",
      });
      return;
    }
    res.send({ status: 200 });
  } catch (err) {
    next(err);
  }
};

export const getCurrentSnapshot = async (_: Request, response: Response) => {
  try {
    const currentWeek = await Week.getCurrent(actualWeekNumber);
    const snapshotTaken = currentWeek && currentWeek.snapshot_date;
    const formattedSnapshot = snapshotTaken && dayjs(snapshotTaken).format();

    const snapshotDate = formattedSnapshot ? formattedSnapshot : null;
    response.status(200).json({ snapshotDate });
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.post("/snapshot", /* tokenVerify, */ takeSnapshotNow);
router.get("/snapshot/current", getCurrentSnapshot);

export default router;
