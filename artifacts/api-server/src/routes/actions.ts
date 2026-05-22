import { Router } from "express";
import { db, actionsTable } from "@workspace/db";
import { eq, like, and, sql } from "drizzle-orm";
import {
  ListActionsQueryParams,
  GetActionParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/actions/stats", async (req, res) => {
  try {
    const all = await db.select().from(actionsTable);

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byAdministration: Record<string, number> = {};

    for (const a of all) {
      byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      byAdministration[a.administration] = (byAdministration[a.administration] ?? 0) + 1;
    }

    res.json({
      totalActions: all.length,
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      byAdministration: Object.entries(byAdministration).map(([administration, count]) => ({ administration, count })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get action stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/actions", async (req, res) => {
  try {
    const parsed = ListActionsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { category, administration, search } = parsed.data;

    let rows = await db.select().from(actionsTable);

    if (category) rows = rows.filter((r) => r.category === category);
    if (administration) rows = rows.filter((r) => r.administration === administration);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list actions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/actions/:id", async (req, res) => {
  try {
    const parsed = GetActionParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [row] = await db
      .select()
      .from(actionsTable)
      .where(eq(actionsTable.id, parsed.data.id));

    if (!row) {
      res.status(404).json({ error: "Action not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get action");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
