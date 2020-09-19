import { db } from "../services";

export interface UserType {
  email: string;
  password: string;
}

export class User {
  public static async get(email: string): Promise<UserType | undefined> {
    const connection = await db.connect();
    try {
      const user = await connection.oneOrNone(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      return user;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }

  public static async insert(params: Array<string>): Promise<UserType | undefined> {
    const connection = await db.connect();
    try {
      const user = await connection.oneOrNone(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        params
      );
      return user;
    } catch (error) {
      console.log("Error ", error);
      return undefined;
    } finally {
      connection.done();
    }
  }
}
