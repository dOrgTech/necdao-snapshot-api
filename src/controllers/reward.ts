import { Router, Request, Response } from "express";
import { authenticate } from "passport";
import { sign, Secret } from "jsonwebtoken";

import { Period, PeriodType } from "../models/Period";
import { Reward } from "../models/Reward";

const router = Router();

export const getAllRewards = async (_: Request, response: Response) => {
  try {
    let rewards = await Reward.getAll();
    console.log(rewards)
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

export const getThisWeekRewards = async (request: Request, response: Response) => {
  // const { email, password } = request.body;
  // try {
  //   let user = await Period.get(email);
  //   if (user) {
  //     response.send({ status: 401, message: "Email already registered" });
  //   } else {
  //     const userInfo = [email, password];
  //     user = await Period.insert(userInfo);
  //     const token = sign(user!, process.env.SECRET_KEY as Secret);
  //     response.send({ status: 200, user, token });
  //   }
  // } catch (error) {
  //   console.log("Error ", error);
  //   response.send({ status: 500 });
  // }
};

export const getRewardsByAddress = async (request: Request, response: Response) => {
  const { address } = request.params

  try {
    const rewards = await Reward.getAllByAddress(address)
    response.status(200).json(rewards)
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
}

router.get("/reward/all", getAllRewards);
router.get("/reward/address/:address", getRewardsByAddress)

export default router;
