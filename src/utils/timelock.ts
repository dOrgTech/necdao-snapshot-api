import HDWalletProvider from "@truffle/hdwallet-provider";
import { Week, Reward, WeekType } from "../models";
import Web3 from "web3";
import dayjs from "dayjs";
const { abi, bytecode } = require("../../build/contracts/TokenTimelock.json");

const unlockTime = process.env.DEVELOPMENT === 'true'? 10800: 31556952

export const deployTimeLockingContract = async (week: WeekType) => {
  const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY as string,
    `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
  );
  const web3 = new Web3(provider);
  const from = (await web3.eth.getAccounts())[0];
  const deploymentParams = {
    data: bytecode,
    arguments: ["0xcc80c051057b774cd75067dc48f8987c4eb97a5e", unlockTime],
  };
  const contract = await new web3.eth.Contract(abi)
    .deploy(deploymentParams)
    .send({ from });
  console.log("Contract deployed at address: " + contract.options.address);

  const unlockDate = dayjs.utc().add(unlockTime, 'second').format('YYYY-MM-DDTHH:mm:ssZ')

  await Week.addContractToWeek(week!.id.toString(), contract.options.address, unlockDate);

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
}