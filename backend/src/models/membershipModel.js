import pool from "../config/db.js";

export const joinGroup = async (user_id, group_id) => {
  const result = await pool.query(
    "INSERT INTO memberships (user_id, group_id) VALUES ($1, $2) RETURNING *",
    [user_id, group_id]
  );
  return result.rows[0];
};

export const leaveGroup = async (user_id, group_id) => {
  const result = await pool.query(
    "DELETE FROM memberships WHERE user_id=$1 AND group_id=$2 RETURNING *",
    [user_id, group_id]
  );
  return result.rows[0];
};

export const getGroupMembers = async (group_id) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, m.joined_at
     FROM memberships m
     JOIN users u ON m.user_id = u.id
     WHERE m.group_id = $1
     ORDER BY m.joined_at ASC`,
    [group_id]
  );
  return result.rows;
};
