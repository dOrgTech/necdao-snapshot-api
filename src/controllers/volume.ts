import { NextFunction, Request, Response, Router } from "express";
import { Reward, Week } from "../models";
import { addBeneficiaries, deployTimeLockingContract } from "../utils/timelock";
import dayjs, { actualWeekNumber, getCurrentWeek } from "../utils/day";

import { getLast24HoursVolume } from "../services/diversifiApi";
import { parse } from "json2csv";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

const getLast24HoursVolumeWrapper = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const volume = await getLast24HoursVolume();

    if(volume) {
      res.header("Content-Type", "application/json");
      res.status(200).json(volume)
    } else {
      res.status(500).json({
        error: true,
        message: "No volume data found",
      });
    }
  } catch (err) {
    next(err);
  }
};

router.get("/volume", tokenVerify, getLast24HoursVolumeWrapper);

export default router;
