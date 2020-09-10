import { actualWeekNumber, today } from "../utils/day";
import { GraphQLClient } from "../graphql/client";
import { GET_BPT_HOLDERS } from "../graphql/queries";

import { Week } from "../models";
import { Reward } from "../models";

interface PoolShares {
  userAddress: {
    id: string;
  };
  balance: string;
}

const getProrataShares = (poolshares: PoolShares[]) => {
  const totalShares = poolshares.reduce((prev, next) => {
    return prev + Number(next.balance);
  }, 0);

  return poolshares.map((p) => {
    const userBalance = Number(p.balance);

    return {
      address: p.userAddress.id,
      balance: userBalance,
      prorataPercentage: (userBalance * 100) / totalShares,
    };
  });
};

export const takeSnapshot = async (): Promise<boolean> => {
  const apolloClient = GraphQLClient.getInstance();
  const { data } = await apolloClient.query({
    query: GET_BPT_HOLDERS,
  });

  const shares = getProrataShares(data.poolShares);
  const week = await Week.getCurrent(actualWeekNumber);
  if (week && !week.snapshot_date) {
    const distribution = week!.week_nec as number;
    const paramsInfo = shares.map((share) => {
      const { address, balance, prorataPercentage } = share;
      return {
        address,
        bpt_balance: balance,
        nec_earned: distribution * (prorataPercentage / 100),
      };
    });
    await Reward.insertAllAddresses(week!.week_id as number, paramsInfo);
    return true;
  }

  return false;
};

export const publishWeek = async (): Promise<boolean> => {
  try {
    const week = await Week.getCurrent(actualWeekNumber);
    if (!(week?.publish_date && week!.closed)) {
      await Week.updatePublishDate(week!.week_id as number, today);
      return true;
    }
    return false;
  } catch (e) {
    console.log("Error publishing error ", e);
    return false;
  }
};
