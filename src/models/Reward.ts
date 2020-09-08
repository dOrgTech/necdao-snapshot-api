import { db } from "../services/db";

export interface RewardType {
  fk_week_id: number;
  id?: number;
  address: string;
  bpt_balance: number;
  nec_earned: number;
}

export class Period {
  public static async getAllFromWeek(
    weekId: number
  ): Promise<RewardType[] | undefined> {
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

  public static async insertAllAddresses(
    params: Array<RewardType>
  ): Promise<void> {
    const connection = await db.connect();
    try {
    
      await connection.tx(async (transaction) => {
        const queries: any = [
          // transaction.none(`
          //   UPDATE week SET snapshot_date = now()
          //   WHERE id = $1
          // `, []
          // )
        ];
        Object.values(params).forEach((reward: any) => {
          const period = transaction.oneOrNone(
            `INSERT INTO period 
            (fk_week_id, address, bpt_balance, nec_earned) 
            VALUES ($1, $2, $3, $4)`,
            [...reward]
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
