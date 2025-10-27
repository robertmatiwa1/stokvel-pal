import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Parse connection URL to ensure password is a clean string
const connectionString = String(process.env.DATABASE_URL).trim();

const pool = new Pool({
  connectionString,
  ssl: false, // set to { rejectUnauthorized: false } if using cloud DB
});

export default pool;
