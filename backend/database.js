
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");

// Create or open the SafeHer database
const db = new DatabaseSync(
    path.join(__dirname, "safeher.db")
);

// Create the users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        mobile TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log("SafeHer database created successfully! ❤️");

module.exports = db;
