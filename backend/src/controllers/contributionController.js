import { createContribution, listContributionsByGroup, listMemberTotalsByGroup, groupTotal } from "../models/contributionModel.js";
import pool from "../config/db.js";

export async function postContribution(req, res) {
  try {
    const { group_id, user_id, amount, paid_at, note } = req.body || {};

    if (!group_id || !user_id) {
      return res.status(400).json({ message: "Missing group_id or user_id" });
    }

    const cleanAmount = Number(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a number greater than 0" });
    }

    const membership = await pool.query(
        'SELECT 1 FROM memberships WHERE group_id = $1 AND user_id = $2 LIMIT 1',
        [group_id, user_id]
    );

    if (!membership.rows.length === 0) {
      return res.status(403).json({ message: "User is not a member of this group" });
    }

    const created = await createContribution({
      group_id,
      user_id,
      amount: cleanAmount,
      paid_at: paid_at ? new Date(paid_at) : undefined,
      note,
    });

    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

export async function getGroupContributions(req, res) {
  try {
    const { groupId } = req.params;

    const items = await listContributionsByGroup(groupId);
    const totalsByMember = await listMemberTotalsByGroup(groupId);
    const total = await groupTotal(groupId);

    return res.json({
      total,
      totalsByMember,
      items,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
