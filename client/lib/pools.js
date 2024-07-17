import sql from "better-sqlite3";

const db = sql("pools.db");

export async function getPools() {
  return await db.prepare("SELECT * FROM pools").all();
}

export function savePool(pool) {
  db.prepare(
    `
    INSERT INTO pools
      (name, slug, poolAddress, token1Name, token2Name, token1Address, token2Address)
    VALUES (
            @name,
            @slug,
            @poolAddress,
            @token1Name,
            @token2Name,
            @token1Address,
            @token2Address
    )
    `
  ).run(pool);
}
