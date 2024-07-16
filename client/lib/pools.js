import sql from "better-sqlite3";

const db = sql("pools.db");

export async function getPools() {
  return await db.prepare("SELECT * FROM pools").all();
}
