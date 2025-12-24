import pool from "../config/db.js";

export const joinGroup = async (user_id, group_id) => {
  const result = await pool.query(
    "INSERT INTO memberships (user_id, group_id) VALUES ($1, $2) RETURNING *",
    [user_id, group_id]
  );
  return result.rows[0];
};

export async function getMembershipRole(groupId, userId) {
  const result = await pool.query(
    `SELECT role
     FROM memberships
     WHERE group_id = $1 AND user_id = $2
     LIMIT 1`,
    [groupId, userId]
  );

  return result.rows[0]?.role || null;
}

export const leaveGroup = async (user_id, group_id) => {
  const result = await pool.query(
    "DELETE FROM memberships WHERE user_id=$1 AND group_id=$2 RETURNING *",
    [user_id, group_id]
  );
  return result.rows[0];
};

export const getGroupMembers = async (group_id) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.phone, m.joined_at
     FROM memberships m
     JOIN users u ON m.user_id = u.id
     WHERE m.group_id = $1
     ORDER BY m.joined_at ASC`,
    [group_id]
  );
  return result.rows;
};

/**
 * Add member manually by username + phone:
 * 1) create user if not exists (by phone)
 * 2) add membership (group_id, user_id), ignore if already exists
 * 3) return member details in the same shape as getGroupMembers
 */
export async function addMemberToGroup(groupId, username, phone) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id, username, phone FROM users WHERE phone = $1 LIMIT 1",
      [phone]
    );

    let userId;

    if (existingUser.rows.length === 0) {
      const createdUser = await client.query(
        `INSERT INTO users (username, phone)
         VALUES ($1, $2)
         RETURNING id`,
        [username, phone]
      );
      userId = createdUser.rows[0].id;
    } else {
      userId = existingUser.rows[0].id;

      if (username && username.trim()) {
        await client.query("UPDATE users SET username = $1 WHERE id = $2", [
          username.trim(),
          userId,
        ]);
      }
    }

    await client.query(
      `INSERT INTO memberships (group_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [groupId, userId]
    );

    const memberRes = await client.query(
      `SELECT u.id, u.username, u.phone, m.joined_at
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.group_id = $1 AND m.user_id = $2
       LIMIT 1`,
      [groupId, userId]
    );

    await client.query("COMMIT");
    return memberRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
