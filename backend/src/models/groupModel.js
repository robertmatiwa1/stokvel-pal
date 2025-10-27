import pool from "../config/db.js";

// Create a new group
export const createGroup = async (name, description, created_by) => {
  const result = await pool.query(
    "INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
    [name, description, created_by]
  );
  return result.rows[0];
};

// Get all groups
export const getAllGroups = async () => {
  const result = await pool.query(
    `SELECT g.id, g.name, g.description, g.created_at, u.username AS created_by
     FROM groups g
     JOIN users u ON g.created_by = u.id
     ORDER BY g.created_at DESC`
  );
  return result.rows;
};

// Get group by ID
export const getGroupById = async (id) => {
  const result = await pool.query(
    `SELECT g.id, g.name, g.description, g.created_at, u.username AS created_by
     FROM groups g
     JOIN users u ON g.created_by = u.id
     WHERE g.id = $1`,
    [id]
  );
  return result.rows[0];
};
