import {
  createContribution,
  listContributionsByGroup,
  listMemberTotalsByGroup,
  groupTotal,
  verifyContribution,
  rejectContribution
} from "../models/contributionModel.js";
import pool from "../config/db.js";

export async function postContribution(req, res) {
  try {
    const user_id = req.user?.id;
    const { group_id, amount, paid_at, note } = req.body || {};

    if (!group_id || !user_id) {
      return res.status(400).json({ message: "Missing group_id" });
    }

    const cleanAmount = Number(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a number greater than 0" });
    }

    const membership = await pool.query(
      "SELECT 1 FROM memberships WHERE group_id = $1 AND user_id = $2 LIMIT 1",
      [group_id, user_id]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ message: "User is not a member of this group" });
    }

    const created = await createContribution({
      group_id,
      user_id,
      amount: cleanAmount,
      paid_at: paid_at ? new Date(paid_at) : undefined,
      note
    });

    return res.status(201).json({
      status: "pending",
      message: "Contribution recorded and awaiting verification",
      contribution: created
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

export async function getGroupContributions(req, res) {
  try {
    const { groupId } = req.params;
    const { status } = req.query;

    const items = await listContributionsByGroup(groupId, { status });
    const totalsByMember = await listMemberTotalsByGroup(groupId, { status: "verified" });
    const total = await groupTotal(groupId, { status: "verified" });

    return res.json({
      total,
      totalsByMember,
      items
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

export async function verify(req, res) {
  try {
    const actorUserId = req.user?.id;
    const { id } = req.params;

    if (!actorUserId || !id) {
      return res.status(400).json({ message: "Missing user or contribution id" });
    }

    const updated = await verifyContribution(id, actorUserId);

    if (!updated) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    return res.json({
      status: "verified",
      message: "Contribution verified",
      contribution: updated
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

export async function reject(req, res) {
  try {
    const actorUserId = req.user?.id;
    const { id } = req.params;
    const { note } = req.body || {};

    if (!actorUserId || !id) {
      return res.status(400).json({ message: "Missing user or contribution id" });
    }

    const updated = await rejectContribution(id, actorUserId, note);

    if (!updated) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    return res.json({
      status: "rejected",
      message: "Contribution rejected",
      contribution: updated
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
