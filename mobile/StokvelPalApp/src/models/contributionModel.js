import pool from "../config/db.js";

export async function createContribution({ group_id, user_id, amount, paid_at, note }) {
  const paidAt = paid_at ? new Date(paid_at) : new Date();
  const cleanNote = note ?? null;

  const result = await pool.query(
    `INSERT INTO contributions (group_id, user_id, amount, paid_at, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, group_id, user_id, amount, paid_at, note, created_at`,
    [group_id, user_id, amount, paidAt, cleanNote]
  );

  return result.rows[0];
}

export async function listContributionsByGroup(groupId) {
  const result = await pool.query(
    `SELECT
        c.id,
        c.group_id,
        c.user_id,
        COALESCE(u.username, '') AS username,
        c.amount,
        c.paid_at,
        c.note,
        c.created_at
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.group_id = $1
     ORDER BY c.paid_at DESC`,
    [groupId]
  );

  return result.rows;
}

export async function listMemberTotalsByGroup(groupId) {
  const result = await pool.query(
    `SELECT
        c.user_id,
        COALESCE(u.username, '') AS username,
        COALESCE(SUM(c.amount), 0) AS total
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.group_id = $1
     GROUP BY c.user_id, u.username
     ORDER BY total DESC`,
    [groupId]
  );

  return result.rows;
}

export async function groupTotal(groupId) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM contributions
     WHERE group_id = $1`,
    [groupId]
  );

  return result.rows[0]?.total ?? 0;
}
