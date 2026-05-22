import { Router } from "express";
import { db, supremeCourtCasesTable, administrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListSupremeCourtCasesQueryParams,
  GetSupremeCourtCaseParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/supreme-court/stats", async (req, res) => {
  try {
    const cases = await db.select().from(supremeCourtCasesTable);
    const admins = await db.select().from(administrationsTable);

    const statMap: Record<string, { won: number; lost: number; pending: number; partial: number }> = {};

    for (const c of cases) {
      if (!statMap[c.administration]) {
        statMap[c.administration] = { won: 0, lost: 0, pending: 0, partial: 0 };
      }
      if (c.outcome === "administration_won") statMap[c.administration].won++;
      else if (c.outcome === "administration_lost") statMap[c.administration].lost++;
      else if (c.outcome === "pending") statMap[c.administration].pending++;
      else if (c.outcome === "partial") statMap[c.administration].partial++;
    }

    const adminMap: Record<string, typeof admins[0]> = {};
    for (const a of admins) adminMap[a.slug] = a;

    const result = Object.entries(statMap).map(([slug, counts]) => {
      const admin = adminMap[slug];
      const total = counts.won + counts.lost + counts.pending + counts.partial;
      const decided = counts.won + counts.lost + counts.partial;
      return {
        administration: slug,
        president: admin?.president ?? slug,
        party: admin?.party ?? "Unknown",
        totalCases: total,
        won: counts.won,
        lost: counts.lost,
        pending: counts.pending,
        winRate: decided > 0 ? Math.round((counts.won / decided) * 100) / 100 : 0,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get Supreme Court stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/supreme-court", async (req, res) => {
  try {
    const parsed = ListSupremeCourtCasesQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { administration, outcome } = parsed.data;

    let rows = await db.select().from(supremeCourtCasesTable);

    if (administration) rows = rows.filter((r) => r.administration === administration);
    if (outcome) rows = rows.filter((r) => r.outcome === outcome);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list Supreme Court cases");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/supreme-court/:id", async (req, res) => {
  try {
    const parsed = GetSupremeCourtCaseParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [row] = await db
      .select()
      .from(supremeCourtCasesTable)
      .where(eq(supremeCourtCasesTable.id, parsed.data.id));

    if (!row) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get Supreme Court case");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
