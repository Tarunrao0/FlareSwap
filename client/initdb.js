const sql = require("better-sqlite3");
const db = sql("pools.db");

const dummyPools = [
  {
    name: "USDC/WETH",
    slug: "usdc-weth",
    poolAddress:
      "0xd2b6214e0dfc2bc5cb2e4eb6bf3b3b4ab7b71f56bf550c1953d1d47c7647c832",
    token1Name: "USDC",
    token2Name: "WETH",
    token1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    token2Address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
];

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS pools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        poolAddress TEXT NOT NULL,
        token1Name TEXT NOT NULL,
        token2Name TEXT NOT NULL,
        token1Address TEXT NOT NULL,
        token2Address TEXT NOT NULL 
    )
    `
).run();

async function initData() {
  const stmt = db.prepare(`
        INSERT INTO pools VALUES (
            null,
            @slug,
            @name,
            @poolAddress,
            @token1Name,
            @token2Name,
            @token1Address,
            @token2Address
        )
        `);

  for (const pool of dummyPools) {
    stmt.run(pool);
  }
}

initData();
