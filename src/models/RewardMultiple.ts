import { db } from "../services";

export interface RewardMultipleType {
  limit: number,
  multiple: number,
}

export class RewardMultiple {
  public static async getLast(): Promise<RewardMultipleType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewardMultiples = await connection.manyOrNone(
        `SELECT * FROM reward_multiple`
      );
      return rewardMultiples;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async insert(
    params: Array<RewardMultipleType>
  ): Promise<void> {
    const connection = await db.connect();
    try {

      await connection.tx(async (transaction) => {
        const queries: any = [
        ];
        params.forEach((rewardMultiple: any) => {
          const rewardMultipleParams = Object.values(rewardMultiple)
          const insertion = transaction.oneOrNone(
            `INSERT INTO reward_multiple 
            (volume_minimum, reward_multiple) 
            VALUES ($1, $2)`,
            [...rewardMultipleParams]
          );
          queries.push(insertion);
        });
        transaction.batch(queries);
      });
    } catch (error) {
      console.log("Error ", error);
      throw error;
    } finally {
      connection.done();
    }
  }

  public static async update(
    rewardMultiple: RewardMultipleType
  ): Promise<void> {
    const connection = await db.connect();
    try {

      await connection.tx(async (transaction) => {
        const queries: any = [
        ];
        const rewardMultipleParams = Object.values(rewardMultiple)
        const insertion = transaction.oneOrNone(
          `UPDATE reward_multiple 
          SET volume_minimum = $1, reward_multiple = $2
          WHERE id = $3`,
          [...rewardMultipleParams]
        );
        queries.push(insertion);
        transaction.batch(queries);
      });
    } catch (error) {
      console.log("Error ", error);
      throw error;
    } finally {
      connection.done();
    }
  }

  public static async del(
    id: Number
  ): Promise<void> {
    const connection = await db.connect();
    try {

      await connection.tx(async (transaction) => {
        const queries: any = [
        ];
        const rewardMultipleParams = Object.values({id});
        const deletion = transaction.oneOrNone(
          `DELETE FROM reward_multiple 
            WHERE id = $1`,
          [...rewardMultipleParams]
        );
        queries.push(deletion);
        transaction.batch(queries);
      });
    } catch (error) {
      console.log("Error ", error);
      throw error;
    } finally {
      connection.done();
    }
  }
}
