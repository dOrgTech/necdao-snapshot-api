import dayjs, { actualWeekNumber, getCurrentWeek, today } from "../utils/day";
import { GraphQLClient } from "../graphql/client";
import { GET_BPT_HOLDERS } from "../graphql/queries";

import { Week, WeekType, RewardMultiple } from "../models";
import { Reward } from "../models";
import { getCorrectMultipleFromTradingVolume, getLast24HoursVolume } from "./diversifiApi";

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

    console.log("ID: ", p.userAddress.id)

    return {
      address: p.userAddress.id,
      balance: userBalance,
      prorataPercentage: (userBalance * 100) / totalShares,
    };
  });
};

export const takeSnapshot = async (id?: string): Promise<boolean> => {
  const apolloClient = GraphQLClient.getInstance();
  const { data } = await apolloClient.query({
    query: GET_BPT_HOLDERS,
    fetchPolicy: "no-cache"
  });

  console.log(JSON.stringify(data))

  const shares = getProrataShares(data.poolShares);
  const week = id ? await Week.getWeekById(id) : await getCurrentWeek();

  if (!week) {
    return false;
  }

  const weekIsFuture = dayjs.utc(week.start_date).isAfter(dayjs.utc());
  if (!week.snapshot_date && !weekIsFuture) {
    const volumns = await getLast24HoursVolume()
    const lastMultiples = await RewardMultiple.getLast()
    const distribution = week!.nec_to_distribute as number;
    const paramsInfo = shares.map((share) => {
      const { address, balance, prorataPercentage } = share;
      const userHasTrade = volumns.find((volume: any) => volume.address === address.toLowerCase())
      const userTradingVolume = userHasTrade ? userHasTrade.USDVolume : 0
      const correspondingMultiple = getCorrectMultipleFromTradingVolume(userTradingVolume, lastMultiples)
      const multiplier = correspondingMultiple? correspondingMultiple.multiplier: 0

      return {
        address,
        bpt_balance: balance,
        nec_earned: Number(((distribution * (prorataPercentage / 100)) * multiplier).toFixed(18)),
        trading_volume: userTradingVolume,
        fk_multipliers_id: correspondingMultiple && correspondingMultiple.multipliers_id
      };
    });
    await Reward.insertAllAddresses(week!.id as number, paramsInfo);
    return true;
  }

  return false;
};

export const publishWeek = async (
  id?: string
): Promise<undefined | WeekType> => {
  try {
    const week = id ? await Week.getWeekById(id) : await getCurrentWeek();
    if (!week) {
      return undefined;
    }

    if (!week.snapshot_date) {
      await takeSnapshot(id);
    }

    const weekIsFuture = dayjs.utc(week.start_date).isAfter(dayjs.utc());

    if (!week.publish_date && !week.closed && !weekIsFuture) {
      await Week.updatePublishDate(week!.id as number, today());
      return week;
    }
    return undefined;
  } catch (e) {
    console.log("Error publishing error ", e);
    return undefined;
  }
};
