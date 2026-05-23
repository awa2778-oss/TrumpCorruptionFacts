import { Router } from "express";
import { db, retributionActionsTable } from "@workspace/db";
import { ListRetributionActionsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/retribution/stats", async (req, res) => {
  try {
    const all = await db.select().from(retributionActionsTable);

    const byTargetType: Record<string, number> = {};
    const byOutcome: Record<string, number> = {};
    let blocked = 0;
    let judiciallyReversed = 0;

    for (const r of all) {
      byTargetType[r.targetType] = (byTargetType[r.targetType] ?? 0) + 1;
      byOutcome[r.outcome] = (byOutcome[r.outcome] ?? 0) + 1;
      if (r.outcome === "blocked") blocked++;
      if (r.outcome === "reversed") judiciallyReversed++;
      if (r.judicialResponse && r.outcome !== "blocked") blocked++;
    }

    res.json({
      total: all.length,
      blocked,
      judiciallyReversed,
      byTargetType: Object.entries(byTargetType).map(([targetType, count]) => ({ targetType, count })),
      byOutcome: Object.entries(byOutcome).map(([outcome, count]) => ({ outcome, count })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get retribution stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/retribution", async (req, res) => {
  try {
    const parsed = ListRetributionActionsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { targetType, outcome } = parsed.data;
    let rows = await db.select().from(retributionActionsTable);

    if (targetType) rows = rows.filter((r) => r.targetType === targetType);
    if (outcome) rows = rows.filter((r) => r.outcome === outcome);

    rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const out = rows.map((r) => ({
      ...r,
      trumpConnection: r.trumpConnection ?? null,
      connectionType: r.connectionType ?? null,
    }));
    res.json(out);
  } catch (err) {
    req.log.error({ err }, "Failed to list retribution actions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
