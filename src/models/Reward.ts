import { db } from "../services";

export interface RewardType {
  address: string;
  bpt_balance: number;
  nec_earned: number;
  fk_week_id?: number;
  id?: number;
}

export class Reward {
  public static async getAllFromWeek(weekId: number): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT * FROM reward 
         WHERE fk_week_id = $1 
         JOIN week ON reward.fk_week_id = week.id`,
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

  public static async getAllByAddress(address: string, periodId: string): Promise<RewardType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.manyOrNone(
        `SELECT ROW_NUMBER() OVER() as week_number, week.nec_to_distribute as week_nec, week.id as week_id, * FROM reward
         RIGHT JOIN week ON reward.fk_week_id = week.id
         JOIN period ON week.fk_period_id = period.id
         WHERE address = $1 OR address IS NULL AND fk_period_id = $2`,
        [address, periodId]
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
            (fk_week_id, address, bpt_balance, nec_earned) 
            VALUES ($1, $2, $3, $4)`,
            [weekId, ...rewardParams]
          );
          queries.push(period);
        });
        transaction.batch(queries);
      });
    } catch (error) {
      console.log("Error ", error);
    } finally {
      connection.done();
    }
  }
}
