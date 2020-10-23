import { Reward, Week, WeekType } from "../models";
import BN from 'bn.js'

import HDWalletProvider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import dayjs from "dayjs";

const { abi, bytecode } = require("../../build/contracts/TokenTimelock.json");

const unlockTime = process.env.DEVELOPMENT === "true" ? 10800 : 31556952;

const network = process.env.NETWORK || 'rinkeby';

console.log(process.env.NETWORK, network)

export const addBeneficiaries = async (week: WeekType | undefined) => {
  const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY as string,
    `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
  );
  const web3 = new Web3(provider);
  const from = (await web3.eth.getAccounts())[0];

  const rewards = await Reward.getAllFromWeek(week!.id.toString());

  const claimers = rewards!.map((reward: any) => reward.address);
  const amounts = rewards!.map((reward: any) => {
    console.log(web3.utils.toWei(reward.nec_earned))
    return web3.utils.toWei(reward.nec_earned)
  }
  );
  const totalRewards = rewards!.length;

  if (!week) {
    throw new Error("No week found for addBeneficiaries");
  }

  if (!week.contract_address) {
    throw new Error("Week has no deployed contract associated");
  }

  const contractInstance = new web3.eth.Contract(abi, week.contract_address);

  console.log("Claimers ", claimers);
  console.log("Amounts ", amounts);
  console.log("Total rewards", totalRewards);
  try {
    if (totalRewards > 500) {
      let prevLimit = 0;
      let limit = 499;
      while (limit < totalRewards) {
        let claimersToAdd = [];
        let amountsToAdd = [];
        for (let i = prevLimit; i < limit; i++) {
          claimersToAdd.push(claimers[i]);
          amountsToAdd.push(amounts[i]);
        }
        await contractInstance.methods
          .addBeneficiaries(claimersToAdd, amountsToAdd)
          .send({ from });
        prevLimit = limit;
        let newLimit = limit + 500;
        limit =
          newLimit > totalRewards
            ? totalRewards
            : limit == totalRewards
            ? limit + 1
            : newLimit;
      }
    } else {
      console.log("We are adding the claimers");
      const estimatedGas = await contractInstance.methods.addBeneficiaries(claimers, amounts).estimateGas({ from })
      console.log(estimatedGas)
      
      await contractInstance.methods
        .addBeneficiaries(claimers, amounts)
        .send({ from });
    }
  } catch (e) {
    console.log("Error adding beneficiaries: ", e);
  }
};

export const deployTimeLockingContract = async (week: WeekType) => {
  const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY as string,
    `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
  );
  const web3 = new Web3(provider);
  const from = (await web3.eth.getAccounts())[0];
  const deploymentParams = {
    data: bytecode,
    arguments: ["0xcc80c051057b774cd75067dc48f8987c4eb97a5e", unlockTime],
  };

  const gasPriceMedia = await web3.eth.getGasPrice();
  const gasPrice = (Number(gasPriceMedia) + 10000000000).toString(); // Let's sum 10 gwei so we make sure the deployment will be mined
  const contractInstance = await new web3.eth.Contract(abi)
    .deploy(deploymentParams)
    .send({ from, gasPrice });

  console.log(
    "Contract has been deployed at address (check on the resolve of the promise): ",
    contractInstance.options.address
  );

  const unlockDate = dayjs
    .utc()
    .add(unlockTime, "second")
    .format("YYYY-MM-DDTHH:mm:ssZ");
  await Week.addContractToWeek(
    week!.id.toString(),
    contractInstance.options.address,
    unlockDate
  );

  const refetchedWeek = await Week.getWeekById(week!.id.toString());
  await addBeneficiaries(refetchedWeek);
};
