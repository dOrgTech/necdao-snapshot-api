import { Router, Request, Response } from "express";
import { Reward, Week } from "../models";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

export const getAllWeeks = async (_: Request, response: Response) => {
  try {
    let rewards = await Week.getAllWeeks();
    response.status(200).json(rewards);
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

export const getAllWeeksAndRewards = async (
  request: Request,
  response: Response
) => {
  try {
    const { address: clientAddress } = request.params;
    const address = clientAddress.toLowerCase()
    const weeks = await Week.getAllWeeks() as any;
    const rewards = await Reward.getAllByAddress(address) as any;

    const result = weeks?.map((week: any) => {
      const rewardThatWeek = rewards.find(
        (reward: any) => reward.fk_week_id === week.id
      );

      if (!week.closed) {
        week = {
          ...week,
          snapshot_date: null
        }
      } else {
        if (rewardThatWeek) {
          week = {
            ...week,
            address: rewardThatWeek.address,
            bpt_balance: rewardThatWeek.bpt_balance,
            nec_earned: rewardThatWeek.nec_earned,
            trading_volume: rewardThatWeek.trading_volume,
            multiplier: rewardThatWeek.multiplier
          };
        }
      }

      return week;
    });
    response.status(200).json(result);
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

router.get("/week/all", tokenVerify, getAllWeeks);
router.get("/week/rewards/:address", getAllWeeksAndRewards);

export default router;
