import { Router, Request, Response } from "express";

import { actualWeekNumber } from "../utils/day";
import { Reward } from "../models";
import { Week } from "../models";

const router = Router();

export const getAllRewards = async (_: Request, response: Response) => {
  try {
    let rewards = await Reward.getAll();
    response.status(200).json(rewards)
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
  }
};

export const getRewardsByAddress = async (request: Request, response: Response) => {
  const { address } = request.params
  try {
    const currentWeek = await Week.getCurrent(actualWeekNumber);
    const periodId = currentWeek && currentWeek!.fk_period_id.toString()
    const rewards = periodId && await Reward.getAllByAddress(address, periodId) as any
    const weekIds = periodId && await Week.getAllWeekIdsByPeriod(periodId) as { id: number, fk_period_id: number }[]
    const formattedWeekIds = weekIds && weekIds.map(w => w.id)
    let filterSnapshots = formattedWeekIds && rewards && rewards.map((rewardRow: any) => {
      if (rewardRow.fk_period_id == periodId) {
         if(!rewardRow.closed) {
          return { ...rewardRow, snapshot_date: null, nec_earned: null, bpt_balance: null }
        }
        return rewardRow
      }
    }).filter((snapshot: any) => snapshot)
      
    if(!filterSnapshots) {
      throw new Error('No filtered snapshots')
    }

    response.status(200).json(filterSnapshots)
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
  }
}

export const getRemainingAndTotalRewards = async (_: Request, response: Response) => {
  try {
    const nextPeriod = await Reward.getNextPeriodId()

    if(!nextPeriod) {
      response.status(404).json({ error: "There is no next period scheduled" })
      return
    }

    const periodId = nextPeriod.id
    const necResults = await Reward.getRemainingAndTotalNecByPeriod(periodId)

    if(!necResults) {
      throw new Error('Error while retrieving remaining and total period NEC results')
    }

    response.status(200).json(necResults)
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
  }
}

router.get("/reward/all", getAllRewards);
router.get("/reward", getRemainingAndTotalRewards)
router.get("/reward/address/:address", getRewardsByAddress)

export default router;
