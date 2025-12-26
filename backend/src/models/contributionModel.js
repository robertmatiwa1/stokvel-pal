import pool from "../config/db.js";

export async function createContribution({ group_id, user_id, amount, paid_at, note }) {
  const paidAt = paid_at ? new Date(paid_at) : new Date();
  const cleanNote = note ?? null;

  const result = await pool.query(
    `INSERT INTO contributions (group_id, user_id, amount, paid_at, note, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at`,
    [group_id, user_id, amount, paidAt, cleanNote]
  );

  return result.rows[0];
}

export async function listContributionsByGroup(groupId, { status } = {}) {
  const params = [groupId];
  let statusClause = "";

  if (status) {
    params.push(status);
    statusClause = ` AND c.status = $${params.length} `;
  }

  const result = await pool.query(
    `SELECT
        c.id,
        c.group_id,
        c.user_id,
        COALESCE(u.username, '') AS username,
        c.amount,
        c.paid_at,
        c.note,
        c.status,
        c.verified_by,
        c.verified_at,
        c.created_at,
        c.updated_at,
        c.updated_by,
        c.deleted_at,
        c.deleted_by,
        c.delete_reason
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.group_id = $1
       AND c.deleted_at IS NULL
       ${statusClause}
     ORDER BY c.paid_at DESC, c.created_at DESC`,
    params
  );

  return result.rows;
}

export async function listMemberTotalsByGroup(groupId, { status = "verified" } = {}) {
  const result = await pool.query(
    `SELECT
        c.user_id,
        COALESCE(u.username, '') AS username,
        COALESCE(SUM(c.amount), 0) AS total
     FROM contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.group_id = $1
       AND c.deleted_at IS NULL
       AND c.status = $2
     GROUP BY c.user_id, u.username
     ORDER BY total DESC`,
    [groupId, status]
  );

  return result.rows;
}

export async function groupTotal(groupId, { status = "verified" } = {}) {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM contributions
     WHERE group_id = $1
       AND deleted_at IS NULL
       AND status = $2`,
    [groupId, status]
  );

  return result.rows[0]?.total ?? 0;
}

/**
 * Monthly summary for a group for a given year.
 * Counts only verified contributions, excludes deleted.
 */
export async function getMonthlyContributionSummary(groupId, year) {
  const y = Number(year);

  if (!Number.isInteger(y) || y < 2000 || y > 2100) {
    throw new Error("Invalid year");
  }

  const result = await pool.query(
    `
    WITH months AS (
      SELECT generate_series(
        date_trunc('year', make_date($2, 1, 1)),
        date_trunc('year', make_date($2, 1, 1)) + interval '11 months',
        interval '1 month'
      ) AS m
    )
    SELECT
      to_char(m.m, 'YYYY-MM') AS month,
      COALESCE(SUM(c.amount), 0) AS in_total,
      COALESCE(COUNT(c.id), 0) AS tx_count
    FROM months m
    LEFT JOIN contributions c
      ON date_trunc('month', COALESCE(c.paid_at, c.created_at)) = m.m
      AND c.group_id = $1
      AND c.deleted_at IS NULL
      AND c.status = 'verified'
    GROUP BY m.m
    ORDER BY m.m;
    `,
    [groupId, y]
  );

  return result.rows;
}

export async function verifyContribution(contributionId, actorUserId) {
  const result = await pool.query(
    `UPDATE contributions
     SET status = 'verified',
         verified_by = $2,
         verified_at = NOW(),
         updated_at = NOW(),
         updated_by = $2
     WHERE id = $1
       AND deleted_at IS NULL
     RETURNING id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, updated_at, updated_by`,
    [contributionId, actorUserId]
  );

  return result.rows[0] || null;
}

export async function rejectContribution(contributionId, actorUserId, note) {
  const result = await pool.query(
    `UPDATE contributions
     SET status = 'rejected',
         verified_by = $2,
         verified_at = NOW(),
         note = COALESCE($3, note),
         updated_at = NOW(),
         updated_by = $2
     WHERE id = $1
       AND deleted_at IS NULL
     RETURNING id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, updated_at, updated_by`,
    [contributionId, actorUserId, note ?? null]
  );

  return result.rows[0] || null;
}

export async function updateContribution(contributionId, actorUserId, { amount, paid_at, note }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const beforeRes = await client.query(
      `SELECT id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, updated_at, updated_by, deleted_at, deleted_by
       FROM contributions
       WHERE id = $1
       LIMIT 1`,
      [contributionId]
    );

    if (beforeRes.rows.length === 0) {
      throw new Error("Contribution not found");
    }

    const before = beforeRes.rows[0];

    if (before.deleted_at) {
      throw new Error("Cannot edit a deleted contribution");
    }

    const newAmount = amount !== undefined ? amount : before.amount;
    const newPaidAt = paid_at !== undefined ? new Date(paid_at) : before.paid_at;
    const newNote = note !== undefined ? (note ?? null) : before.note;

    const updatedRes = await client.query(
      `UPDATE contributions
       SET amount = $1,
           paid_at = $2,
           note = $3,
           status = 'pending',
           verified_by = NULL,
           verified_at = NULL,
           updated_at = NOW(),
           updated_by = $4
       WHERE id = $5
       RETURNING id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, updated_at, updated_by`,
      [newAmount, newPaidAt, newNote, actorUserId, contributionId]
    );

    const after = updatedRes.rows[0];

    await client.query(
      `INSERT INTO contribution_audit (contribution_id, group_id, actor_user_id, action, before, after)
       VALUES ($1, $2, $3, 'update', $4::jsonb, $5::jsonb)`,
      [contributionId, before.group_id, actorUserId, JSON.stringify(before), JSON.stringify(after)]
    );

    await client.query("COMMIT");
    return after;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteContribution(contributionId, actorUserId, reason) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const beforeRes = await client.query(
      `SELECT id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, updated_at, updated_by, deleted_at, deleted_by
       FROM contributions
       WHERE id = $1
       LIMIT 1`,
      [contributionId]
    );

    if (beforeRes.rows.length === 0) {
      throw new Error("Contribution not found");
    }

    const before = beforeRes.rows[0];

    if (before.deleted_at) {
      throw new Error("Contribution already deleted");
    }

    const delRes = await client.query(
      `UPDATE contributions
       SET deleted_at = NOW(),
           deleted_by = $1,
           delete_reason = $2
       WHERE id = $3
       RETURNING id, group_id, user_id, amount, paid_at, note, status, verified_by, verified_at, created_at, deleted_at, deleted_by, delete_reason`,
      [actorUserId, reason ?? null, contributionId]
    );

    const after = delRes.rows[0];

    await client.query(
      `INSERT INTO contribution_audit (contribution_id, group_id, actor_user_id, action, before, after)
       VALUES ($1, $2, $3, 'delete', $4::jsonb, $5::jsonb)`,
      [contributionId, before.group_id, actorUserId, JSON.stringify(before), JSON.stringify(after)]
    );

    await client.query("COMMIT");
    return after;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
