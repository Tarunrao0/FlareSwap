const sql = require("better-sqlite3");

// Connect to the SQLite database
const db = sql("pools.db");

// Function to fetch all slugs from the database
function fetchAllSlugs() {
  const pools = db.prepare("SELECT slug FROM pools").all();
  console.log("Slugs in the database:", pools);
}

// Run the function
fetchAllSlugs();
