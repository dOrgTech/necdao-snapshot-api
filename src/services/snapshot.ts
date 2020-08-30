import { GraphQLClient } from "../graphql/client"
import { GET_BPT_HOLDERS } from "../graphql/queries"
import { parse } from 'json2csv';
import { writeFileSync, existsSync, mkdirSync } from "fs";
import compressing from 'compressing';
import { SNAPSHOTS_DIR, COMPRESSED_DIR, COMPRESSED_FILENAME } from "../utils/constants";
import { ScheduledJob } from "../utils/scheduler";
import { scheduleJob } from "node-schedule";
import { dir } from "console";

interface PoolShares {
  userAddress: {
    id: string;
  },
  balance: string
}

const getProrataShares = (poolshares: PoolShares[]) => {
  const totalShares = poolshares.reduce((prev, next) => {
    return prev + Number(next.balance)
  }, 0)

  return poolshares.map(p => {
    const userBalance = Number(p.balance)

    return {
      address: p.userAddress.id,
      balance: userBalance,
      prorataPercentage: userBalance * 100 / totalShares
    }
  })

}

const saveSnapshotToFolder = (name: string, csv: string) => {
  try {
    if (!existsSync(SNAPSHOTS_DIR)){
      mkdirSync(SNAPSHOTS_DIR);
    }
    writeFileSync(`${SNAPSHOTS_DIR}/${name}-${Date.now()}.csv`, csv);
  } catch (err) {
      console.error(err);
  }
}

export const compressSnapshots = async () => {
  try {
    if (!existsSync(SNAPSHOTS_DIR)){
      mkdirSync(SNAPSHOTS_DIR);
    }
    if (!existsSync(COMPRESSED_DIR)){
      mkdirSync(COMPRESSED_DIR);
    }
    await compressing.zip.compressDir(`${SNAPSHOTS_DIR}/`, `${COMPRESSED_DIR}/${COMPRESSED_FILENAME}.zip`)
    return `${COMPRESSED_DIR}/${COMPRESSED_FILENAME}.zip`
  } catch (err) {
    console.error(err);
  }
}

export const takeSnapshot = async () => {
  const apolloClient = GraphQLClient.getInstance()
  const { data } = await apolloClient.query({
    query: GET_BPT_HOLDERS,
  })

  if(data && data.poolShares) {
    const shares = getProrataShares(data.poolShares)
    const csv = parse(shares)
    saveSnapshotToFolder('snapshot', csv)

    return csv
  }
}

export const rescheduleSnapshots = (cronRule: string) => {
  const job = scheduleJob(cronRule, takeSnapshot)
  ScheduledJob.reschedule(job)
}