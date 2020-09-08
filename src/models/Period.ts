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

  public static async insert(params: Array<string>): Promise<PeriodType | undefined> {
    const connection = await db.connect();
    try {
      const period = await connection.oneOrNone(
        "INSERT INTO period (nec_to_distribute) VALUES ($1) RETURNING *",
        params
      );
      return period;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }
}