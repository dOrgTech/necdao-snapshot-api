import { scheduleJob, Job } from "node-schedule";
import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";

import { takeSnapshot, publishWeek } from "../services";
import { Reward, Week } from "../models";

const { abi, bytecode } = require("../../build/contracts/TokenTimelock.json");

const getCronExpression = () => {
  if (process.env.DEVELOPMENT === "true") {
    return "*/10 * * * * *";
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
          const provider = new HDWalletProvider(
            process.env.PRIVATE_KEY as string,
            `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
          );
          const web3 = new Web3(provider);
          const from = (await web3.eth.getAccounts())[0];
          const deploymentParams = {
            data: bytecode,
            arguments: ["0xb132b08112f627cff1a3be863586cd51dcd42b4c", 31556952],
          };
          const contract = await new web3.eth.Contract(abi)
            .deploy(deploymentParams)
            .send({ from });
          console.log("Contract deployed at address: " + contract.options.address);
          Week.addContractToWeek(week!.id.toString(), contract.options.address);

          const rewards = await Reward.getAllFromWeek(week!.id.toString())

          const claimers = rewards!.map((reward: any) => reward.address)
          const amounts = rewards!.map((reward: any) => reward.nec_earned * 1e18)
          const totalRewards = rewards!.length

          if (totalRewards > 500) {
            let prevLimit = 0
            let limit = 499
            while (limit < totalRewards) {
              let claimersToAdd = []
              let amountsToAdd = []
              for (let i=prevLimit; i<limit; i++) {
                claimersToAdd.push(claimers[i])
                amountsToAdd.push(amounts[i])
              }
              await contract.methods.addBeneficiaries(claimersToAdd, amountsToAdd)
              prevLimit = limit
              let newLimit = limit + 500
              limit = newLimit > totalRewards ? totalRewards : limit == totalRewards ? limit + 1 : newLimit
            }
          } else {
            await contract.methods.addBeneficiaries(claimers, amounts)
          }
        } catch (e) {
          console.log(e);
        }
      });
    }

    return ScheduledJob.instance;
  };
}
