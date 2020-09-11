import { db } from "../services";

export interface PeriodType {
  id: number
  nec_to_distribute: number
}

export class Period {
  public static async insert(necToDistribute: number, weekData: { startDate: string, nec: number, endDate: string }[]): Promise<void> {
    const connection = await db.connect();
    try {
      await db.tx(async transaction => {
        const period = await transaction.oneOrNone(
          "INSERT INTO period (nec_to_distribute) VALUES ($1) RETURNING *",
          [necToDistribute]
        );

        for (let i = 0; i < weekData.length; i++) {
          const { startDate, endDate, nec } = weekData[i]

          await transaction.oneOrNone(
            `INSERT INTO week 
             (fk_period_id, nec_to_distribute, start_date, end_date, closed) 
             VALUES ($1, $2, $3, $4, false) 
             RETURNING *`,
            [period.id, nec, startDate, endDate]
          );
        }
      })
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getDates(periodId: string): Promise<{ startDate: string, endDate: string } | undefined> {
    const connection = await db.connect();
    try {
      const rewards = await connection.oneOrNone(
        `SELECT (SELECT start_date FROM week WHERE fk_period_id = $1 ORDER BY start_date ASC LIMIT 1) as start_date,
        (SELECT end_date FROM week WHERE fk_period_id = $1 ORDER BY end_date DESC LIMIT 1) as end_date`,
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

  public static async getNextPeriodId(todayTimeStamp: string, periodId: string) {
    const connection = await db.connect()
    try {
      const period = await connection.oneOrNone(
        `SELECT start_date, fk_period_id as id
        FROM week 
        WHERE start_date > $1 
        AND fk_period_id != $2 
        ORDER BY start_date ASC 
        LIMIT 1`,
        [todayTimeStamp, periodId]
      )

      return period
    } catch (error) {
      console.log("Error ", error)
      return undefined
    } finally {
      connection.done()
    }
  }

  public static async getLastPeriodId(todayTimeStamp: string, periodId: string) {
    const connection = await db.connect()
    try {
      const period = await connection.oneOrNone(
        `SELECT end_date, fk_period_id as id
        FROM week 
        WHERE end_date < $1 
        AND fk_period_id != $2 
        ORDER BY end_date DESC 
        LIMIT 1`,
        [todayTimeStamp, periodId]
      )

      return period
    } catch (error) {
      console.log("Error ", error)
      return undefined
    } finally {
      connection.done()
    }
  }
}