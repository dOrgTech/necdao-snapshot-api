import { db } from "../services/db";

export interface WeekType {
  fk_period_id: number
  id: number
  snapshot_date: string
  publish_date: string
  closed: boolean
  nec_to_distribute: number
  start_date: string
}

export class Week {
  public static async getLastActive(): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT * FROM week 
         WHERE closed = false 
         JOIN period ON week.fk_period_id = period.id 
         ORDER BY id ASC 
         LIMIT 1`
      );
      return week;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getByPeriod(periodId: number): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT * FROM week 
         WHERE week.fk_period_id = $1 
         JOIN period ON week.fk_period_id = period.id 
         ORDER BY id ASC 
         LIMIT 1`,
        [periodId]
      );
      return week;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async insert(params: Array<string>): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `INSERT INTO week 
         (fk_period_id, closed, nec_to_distribute, start_date) 
         VALUES ($1, false, $2, $3) 
         RETURNING *`,
        params
      );
      return week;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async updateSnapshotDate(weekId: number, snapshotDate: string): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const period = await connection.oneOrNone(
        `UPDATE week
         SET snapshot_date = $2 
         WHERE id = $1
         RETURNING *`,
        [weekId, snapshotDate]
      );
      return period;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async updatePublishDate(weekId: number, publishDate: string): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const period = await connection.oneOrNone(
        `UPDATE week
         SET publish_date = $2,
         closed = true,
         WHERE id = $1
         RETURNING *`,
        [weekId, publishDate]
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