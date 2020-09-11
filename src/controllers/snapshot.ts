import { Router, Request, Response, NextFunction } from "express";

import dayjs, { actualWeekNumber, getCurrentWeek } from "../utils/day";
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
    const currentWeek = await getCurrentWeek();

    if (!currentWeek) {
      response.status(404).json({
        error: true,
        message: "No current week/period",
      });

      return;
    }
    const snapshotTaken = currentWeek.snapshot_date;

    if(!snapshotTaken) {
      response.status(404).json({
        error: true,
        message: "No current snapshot",
      });

      return;
    }
    const formattedSnapshot = dayjs(snapshotTaken).format();
    response.status(200).json({ formattedSnapshot });
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
  }
};

router.post("/snapshot", /* tokenVerify, */ takeSnapshotNow);
router.get("/snapshot/current", getCurrentSnapshot);

export default router;
