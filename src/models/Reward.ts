import { db } from "../services";

export interface RewardType {
  address: string;
  bpt_balance: number;
  nec_earned: number;
  fk_week_id?: number;
  id?: number;
}

export class Reward {
  public static async getAllFromWeek(weekId: string): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT * FROM reward JOIN week on reward.fk_week_id = week.id
         JOIN multipliers ON multipliers.id = reward.fk_multipliers_id
         WHERE fk_week_id = $1`,
        [weekId]
      );
      return rewards;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getAllFromPeriod(
    periodId: number
  ): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT * FROM reward 
         WHERE period.id = $1 
         JOIN week ON reward.fk_week_id = week.id
         JOIN period ON week.fk_period_id = period.id`,
        [periodId]
      );
      return rewards;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getAll(): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT * FROM reward
         JOIN week ON reward.fk_week_id = week.id
         JOIN period ON week.fk_period_id = period.id`
      );
      return rewards;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getRemainingAndTotalNecByPeriod(): Promise<{remaining_nec: number, total_nec: number} | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.oneOrNone(
        `SELECT SUM(week.nec_to_distribute) AS remaining_nec,
        (SELECT period.nec_to_distribute FROM period WHERE period.id = $1) AS total_nec
        FROM week 
        WHERE week.closed = false`
      );
      return rewards;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getAllByAddress(address: string): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT * FROM reward JOIN multipliers ON multipliers.id = reward.fk_multipliers_id WHERE address = $1`,
        [address]
      );
      return rewards;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async insertAllAddresses(
    weekId: number,
    params: Array<RewardType>
  ): Promise<void> {
    const connection = await db.connect();
    try {
    
      await connection.tx(async (transaction) => {
        const queries: any = [
          transaction.none(`
            UPDATE week SET snapshot_date = now()
            WHERE id = $1
          `, [weekId]
          )
        ];
        params.forEach((reward: any) => {
          const rewardParams = Object.values(reward)
          const period = transaction.oneOrNone(
            `INSERT INTO reward 
            (fk_week_id, address, bpt_balance, nec_earned, trading_volume, fk_multipliers_id) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [weekId, reward.address, reward.bpt_balance, reward.nec_earned, reward.trading_volume, reward.fk_multipliers_id]
          );
          queries.push(period);
        });
        return await transaction.batch(queries);
      });
    } catch (error) {
      console.log("Error ", error);
    } finally {
      connection.done();
    }
  }
}
