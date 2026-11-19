
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Please add DATABASE_URL to .env.local");
}

export const sql = neon(databaseUrl);
