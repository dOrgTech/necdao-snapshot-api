import { db } from "../services";

export interface RewardMultipleType {
  volume_minimum: number,
  reward_multiple: number,
  id?: number;
}

export class RewardMultiple {
  public static async getAll(): Promise<RewardMultipleType[] | undefined> {
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
    } finally {
      connection.done();
    }
  }
}
