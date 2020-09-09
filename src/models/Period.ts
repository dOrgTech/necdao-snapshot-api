import { db } from "../services/db";

export interface PeriodType {
  id: number
  nec_to_distribute: number
}

export class Period {
  public static async getLatest(): Promise<PeriodType | undefined> {
    const connection = await db.connect();
    try {
      const period = await connection.oneOrNone(
        "SELECT * FROM period ORDER BY id DESC LIMIT 1"
      );
      return period;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async insert(necToDistribute: number, weekData: { startDate: string, nec: number }[]): Promise<void> {
    const connection = await db.connect();
    try {
      await db.tx(async transaction => {
        const period = await transaction.oneOrNone(
          "INSERT INTO period (nec_to_distribute) VALUES ($1) RETURNING *",
          [necToDistribute]
        );

        for (let i = 0; i < weekData.length; i++) {
          const { startDate, nec } = weekData[i]

          await transaction.oneOrNone(
            `INSERT INTO week 
             (fk_period_id, nec_to_distribute, start_date, closed) 
             VALUES ($1, $2, $3, false) 
             RETURNING *`,
            [period.id, nec, startDate]
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
}