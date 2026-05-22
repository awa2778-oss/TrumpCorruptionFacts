import { Router } from "express";
import { db, administrationsTable, actionsTable, supremeCourtCasesTable } from "@workspace/db";

const router = Router();

router.get("/administrations/compare", async (req, res) => {
  try {
    const admins = await db.select().from(administrationsTable).orderBy(administrationsTable.startYear);

    const executiveOrdersTimeline = admins.map((a) => {
      const years = a.endYear
        ? a.endYear - a.startYear + 1
        : new Date().getFullYear() - a.startYear + 1;
      return {
        administration: a.slug,
        president: a.president,
        value: a.executiveOrders,
        perYear: Math.round((a.executiveOrders / Math.max(years, 1)) * 10) / 10,
      };
    });

    const supremeCourtTimeline = admins.map((a) => {
      const years = a.endYear
        ? a.endYear - a.startYear + 1
        : new Date().getFullYear() - a.startYear + 1;
      return {
        administration: a.slug,
        president: a.president,
        value: a.supremeCourtCases,
        perYear: Math.round((a.supremeCourtCases / Math.max(years, 1)) * 10) / 10,
      };
    });

    res.json({
      administrations: admins,
      executiveOrdersTimeline,
      supremeCourtTimeline,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compare administrations");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/administrations", async (req, res) => {
  try {
    const rows = await db.select().from(administrationsTable).orderBy(administrationsTable.startYear);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list administrations");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
