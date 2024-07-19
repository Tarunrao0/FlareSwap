const sql = require("better-sqlite3");

const db = sql("pools.db");

// Remove the invalid slug
db.prepare("DELETE FROM pools WHERE slug = 'USDC-WETH'").run();
db.prepare("DELETE FROM pools WHERE slug = 'USDC-WBTC'").run();
db.prepare("DELETE FROM pools WHERE slug = 'AAVE-WETH'").run();

console.log("Invalid slug removed.");
