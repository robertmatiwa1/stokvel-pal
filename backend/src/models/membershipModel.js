import pool from "../config/db.js";

/**
 * Join group
 * Fix:
 * Return a consistent object with a status flag so the controller/UI can
 * show the correct message.
 *
 * Result shape:
 * { status: "joined" | "already_member", membership: row | null }
 */
export const joinGroup = async (groupId, userId) => {
  const insertRes = await pool.query(
    `INSERT INTO memberships (group_id, user_id, role)
     VALUES ($1, $2, 'member')
     ON CONFLICT (group_id, user_id) DO NOTHING
     RETURNING *`,
    [groupId, userId]
  );

  if (insertRes.rows.length > 0) {
    return { status: "joined", membership: insertRes.rows[0] };
  }

  const existingRes = await pool.query(
    `SELECT *
     FROM memberships
     WHERE group_id = $1 AND user_id = $2
     LIMIT 1`,
    [groupId, userId]
  );

  return { status: "already_member", membership: existingRes.rows[0] || null };
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

export const leaveGroup = async (groupId, userId) => {
  const result = await pool.query(
    "DELETE FROM memberships WHERE group_id = $1 AND user_id = $2 RETURNING *",
    [groupId, userId]
  );
  return result.rows[0];
};

export const getGroupMembers = async (groupId) => {
  const result = await pool.query(
    `SELECT u.id, u.username, u.phone, m.joined_at, m.role
     FROM memberships m
     JOIN users u ON m.user_id = u.id
     WHERE m.group_id = $1
     ORDER BY m.joined_at ASC`,
    [groupId]
  );
  return result.rows;
};

/**
 * Alias used by routes:
 * router.get("/group/:groupId", ...) expects membershipModel.listMembers()
 */
export const listMembers = async (groupId) => {
  return getGroupMembers(groupId);
};

export async function listMembersWithRoles(groupId) {
  const result = await pool.query(
    `SELECT m.user_id, u.username, u.phone, m.role, m.joined_at
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.group_id = $1
     ORDER BY m.joined_at ASC`,
    [groupId]
  );
  return result.rows;
}

export async function updateMemberRole(groupId, targetUserId, newRole, actorUserId) {
  const result = await pool.query(
    `UPDATE memberships
     SET role = $1,
         role_updated_at = NOW(),
         role_updated_by = $4
     WHERE group_id = $2 AND user_id = $3
     RETURNING *`,
    [newRole, groupId, targetUserId, actorUserId]
  );
  return result.rows[0] || null;
}

/**
 * Add member manually by username + phone:
 * Improvement:
 * Return a status flag here too, for consistent UX if you want it.
 */
export async function addMemberToGroup(groupId, username, phone) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const groupCheck = await client.query("SELECT id FROM groups WHERE id = $1 LIMIT 1", [groupId]);
    if (groupCheck.rows.length === 0) {
      const err = new Error("Group does not exist");
      err.status = 400;
      throw err;
    }

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
        await client.query("UPDATE users SET username = $1 WHERE id = $2", [username.trim(), userId]);
      }
    }

    const insertMembershipRes = await client.query(
      `INSERT INTO memberships (group_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (group_id, user_id) DO NOTHING
       RETURNING *`,
      [groupId, userId]
    );

    const memberRes = await client.query(
      `SELECT u.id, u.username, u.phone, m.joined_at, m.role
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.group_id = $1 AND m.user_id = $2
       LIMIT 1`,
      [groupId, userId]
    );

    await client.query("COMMIT");

    return {
      status: insertMembershipRes.rows.length > 0 ? "added" : "already_member",
      member: memberRes.rows[0] || null
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
