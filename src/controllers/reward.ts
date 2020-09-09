import { Router, Request, Response } from "express";
import { authenticate } from "passport";
import { sign, Secret } from "jsonwebtoken";

import { Period, PeriodType } from "../models/Period";
import { Reward } from "../models/Reward";
import { Week } from "../models/Week";
import dayjs from "dayjs";

const router = Router();

export const getAllRewards = async (_: Request, response: Response) => {
  try {
    let rewards = await Reward.getAll();
    response.status(200).json(rewards)
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

export const getRewardsByAddress = async (request: Request, response: Response) => {
  const { address } = request.params

  try {
    const currentWeek = await Week.getCurrent(dayjs().format())
    const periodId = currentWeek && currentWeek!.fk_period_id.toString()
    const rewards = periodId && await Reward.getAllByAddress(address, periodId) as any
    const weekIds = periodId && await Week.getAllWeekIdsByPeriod(periodId) as { id: number, fk_period_id: number }[]
    const formattedWeekIds = weekIds && weekIds.map(w => w.id)
    const filterSnapshots = formattedWeekIds && rewards && rewards.map((rewardRow: any) => {
      if(!rewardRow.closed) {
        return { ...rewardRow, snapshot_date: null, nec_earned: null, bpt_balance: null }
      }

      return rewardRow
    })

    if(!filterSnapshots) {
      throw new Error('No filtered snapshots')
    }

    response.status(200).json(filterSnapshots)
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
}

router.get("/reward/all", getAllRewards);
router.get("/reward/address/:address", getRewardsByAddress)

export default router;
