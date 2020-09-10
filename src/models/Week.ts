import { db } from "../services/db";

export interface WeekType {
  fk_period_id: number
  id: number
  snapshot_date: string
  publish_date: string
  closed: boolean
  nec_to_distribute: number
  start_date: string
  week_nec?: number
  week_id?: number
}

export class Week {
  public static async getLastActive(): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT week.nec_to_distribute as week_nec, p.id as period_id, * FROM week
        JOIN period as p ON week.fk_period_id = p.id 
        WHERE closed = false 
        ORDER BY start_date ASC 
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

  public static async getAllWeekIdsByPeriod(periodId: string) {
    const connection = await db.connect();
    try {
      const week = await connection.manyOrNone(
        `SELECT id, fk_period_id FROM week WHERE fk_period_id = $1`,
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

  public static async getLastWeek(): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT week.nec_to_distribute as week_nec, p.id as period_id, week.start_date FROM week
        JOIN period as p ON week.fk_period_id = p.id 
        ORDER BY start_date DESC 
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

  public static async getCurrent(currentDate: number): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT week.nec_to_distribute as week_nec, week.id as week_id, p.nec_to_distribute as period_nec, * FROM week
        JOIN period as p ON week.fk_period_id = p.id 
        WHERE extract(week from start_date::date) = $1`,
        [currentDate]
      );
      return week;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async getLastWeekByPeriod(periodId: number): Promise<WeekType | undefined> {
    const connection = await db.connect();
    try {
      const week = await connection.oneOrNone(
        `SELECT * FROM week  
         JOIN period ON week.fk_period_id = period.id 
         WHERE week.fk_period_id = $1
         ORDER BY start_date DESC
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
         closed = true
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