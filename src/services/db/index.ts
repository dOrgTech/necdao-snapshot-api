import pgp from "pg-promise";

export const db = pgp()(process.env.DATABASE_URL as string);