import { getMonthlyContributionSummary } from "../models/contributionModel.js";

export async function monthlySummary(req, res) {
  try {
    const { groupId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const rows = await getMonthlyContributionSummary(groupId, year);

    const payload = rows.map((r) => ({
      month: r.month,
      in_total: Number(r.in_total),
      out_total: 0,
      net: Number(r.in_total),
      tx_count: Number(r.tx_count),
    }));

    return res.json(payload);
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Failed to load monthly summary",
    });
  }
}
