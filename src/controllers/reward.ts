import { Router, Request, Response } from "express";

import { actualWeekNumber, getCurrentPeriodId, getCurrentWeek, todayTimestamp } from "../utils/day";
import { Period, Reward } from "../models";
import { Week } from "../models";

const router = Router();

export const getRemainingAndTotalRewards = async (
  _: Request,
  response: Response
) => {
  try {
    const necResults = await Week.getRemainingAndTotalNec()

    if (!necResults) {
      throw new Error(
        "Error while retrieving remaining and total period NEC results"
      );
    }

    response.status(200).json(necResults);
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

router.get("/reward", getRemainingAndTotalRewards);

export default router;
