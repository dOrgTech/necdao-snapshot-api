import { db } from "../services";

export interface RewardMultipleType {
  multipliers_id: string
  lower_limit: number,
  multiplier: number,
}

export class RewardMultiple {
  public static async getLast(): Promise<RewardMultipleType[] | undefined> {
    const connection = await db.connect();
    try {
      const rewardMultiples = await connection.manyOrNone(
        `SELECT *, multipliers.id AS multipliers_id from multipliers 
        JOIN multiplier_group ON multiplier_group.id = multipliers.fk_multiplier_group
        WHERE fk_multiplier_group = (SELECT id FROM multiplier_group ORDER BY date_created DESC LIMIT 1)`
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

      await db.tx(async (transaction) => {
        const multipleGroup = await transaction.oneOrNone(
          `INSERT INTO multiplier_group (date_created) VALUES (CURRENT_TIMESTAMP) RETURNING *`
        )

        for(let i = 0; i < params.length; i++) {
          await transaction.oneOrNone(
          `INSERT INTO multipliers (lower_limit, multiplier, fk_multiplier_group)
           VALUES ($1, $2, $3) RETURNING *`,
           [params[i].lower_limit, params[i].multiplier, multipleGroup.id])
        }
      });
    } catch (error) {
      console.log("Error ", error);
      throw error;
    } finally {
      connection.done();
    }
  }
}
