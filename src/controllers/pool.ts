import { Router, Request, Response } from "express";
import { GraphQLClient } from "../graphql/client";
import { GET_POOL_DATA, GET_BPT_HOLDERS } from "../graphql/queries";
import { Period } from "../models/Period";
import { Week } from "../models/Week";
import dayjs from "dayjs";
import { actualWeekNumber, getCurrentPeriodId, todayTimestamp } from "../utils/day";
import { Reward } from "../models/Reward";

const router = Router();

export const calculateAPY = async (_: Request, response: Response) => {
  try {
    
    const apolloClient = GraphQLClient.getInstance();
    const { data: poolData } = await apolloClient.query({
      query: GET_POOL_DATA,
    });

    const { data: sharesData } = await apolloClient.query({
      query: GET_BPT_HOLDERS,
    });

    const fetchedResult = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=nectar-token&vs_currencies=usd`
    );
    const priceResponse = await fetchedResult.json();
    const necPrice = priceResponse["nectar-token"].usd;

    const pools = poolData && poolData.pools;
    const pool = pools && pools.length > 0 && pools[0];
    const liquidity = pool && Number(pool.liquidity);

    const shares = sharesData && sharesData.poolShares;
    const bptBalanceSum =
      shares &&
      shares.reduce((prev: any, current: any) => {
        return prev + Number(current.balance);
      }, 0);

    const week = await Week.getThisOrLastWeekNec(todayTimestamp())

    const currentNecToDistribute = week ? Number(week.nec_to_distribute) : 0;

    const bptPrice = liquidity / bptBalanceSum;

    const apy = ((currentNecToDistribute * necPrice) / (bptBalanceSum * bptPrice)) * 52 * 100

    if (bptBalanceSum && liquidity) {
      response
        .status(200)
        .json({
          apy,
          necPrice,
        });
    } else {
      throw new Error("Error calculating balances");
    }
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true  });
  }
};

router.get("/pool/apy", calculateAPY);

export default router;
