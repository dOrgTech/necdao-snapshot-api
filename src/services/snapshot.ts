import { actualWeekNumber, today } from "../utils/day";
import { GraphQLClient } from "../graphql/client";
import { GET_BPT_HOLDERS } from "../graphql/queries";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import compressing from "compressing";
import {
  SNAPSHOTS_DIR,
  COMPRESSED_DIR,
  COMPRESSED_FILENAME,
} from "../utils/constants";
import { ScheduledJob } from "../utils/scheduler";
import { scheduleJob } from "node-schedule";
import { Week } from "../models/Week";
import { Reward } from "../models/Reward";

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

const saveSnapshotToFolder = (name: string, csv: string) => {
  try {
    if (!existsSync(SNAPSHOTS_DIR)) {
      mkdirSync(SNAPSHOTS_DIR);
    }
    writeFileSync(`${SNAPSHOTS_DIR}/${name}-${Date.now()}.csv`, csv);
  } catch (err) {
    console.error(err);
  }
};

export const compressSnapshots = async () => {
  try {
    if (!existsSync(SNAPSHOTS_DIR)) {
      mkdirSync(SNAPSHOTS_DIR);
    }
    if (!existsSync(COMPRESSED_DIR)) {
      mkdirSync(COMPRESSED_DIR);
    }
    await compressing.zip.compressDir(
      `${SNAPSHOTS_DIR}/`,
      `${COMPRESSED_DIR}/${COMPRESSED_FILENAME}.zip`
    );
    return `${COMPRESSED_DIR}/${COMPRESSED_FILENAME}.zip`;
  } catch (err) {
    console.error(err);
  }
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

export const rescheduleSnapshots = (cronRule: string) => {
  const job = scheduleJob(cronRule, takeSnapshot);
  ScheduledJob.reschedule(job);
};
