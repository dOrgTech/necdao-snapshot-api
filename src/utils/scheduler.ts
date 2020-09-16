import { scheduleJob, Job } from "node-schedule";
import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";

import { takeSnapshot, publishWeek } from "../services";
import { Reward, Week } from "../models";
import { deployTimeLockingContract } from "./timelock";

const getCronExpression = () => {
  if (process.env.DEVELOPMENT === "true") {
    return "25 */1 * * *";
  }

  return "0 16 * * */0";
};

export class ScheduledJob {
  private static instance: Job | undefined;

  private constructor() {}

  public static getInstance = () => {
    if (!ScheduledJob.instance) {
      //0 16 * * */0 -> every sunday at afternoon (16:00)
      ScheduledJob.instance = scheduleJob(getCronExpression(), async () => {
        try {
          console.log("Running job!");
          await takeSnapshot();
          const week = await publishWeek();

          if(!week) {
            throw new Error('Contract could not be deployed because week was already closed')
          }

          await deployTimeLockingContract(week)

        } catch (e) {
          console.log(e);
        }
      });
    }

    return ScheduledJob.instance;
  };
}
