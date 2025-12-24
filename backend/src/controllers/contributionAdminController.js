import { updateContribution, deleteContribution } from "../models/contributionModel.js";

export async function editContribution(req, res) {
  try {
    const { contributionId } = req.params;
    const actorUserId = req.user.id;

    const updated = await updateContribution(contributionId, actorUserId, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to edit contribution" });
  }
}

export async function removeContribution(req, res) {
  try {
    const { contributionId } = req.params;
    const actorUserId = req.user.id;
    const { reason } = req.body;

    const deleted = await deleteContribution(contributionId, actorUserId, reason);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to delete contribution" });
  }
}
