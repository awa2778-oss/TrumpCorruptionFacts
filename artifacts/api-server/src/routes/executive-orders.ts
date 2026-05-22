import { Router } from "express";
import { db, actionsTable, overreachIncidentsTable, administrationsTable } from "@workspace/db";
import { ListExecutiveOrdersQueryParams } from "@workspace/api-zod";

const router = Router();

const JUDICIAL_STATUS_PRIORITY: Record<string, number> = {
  challenged_blocked: 0,
  challenged_pending: 1,
  challenged_partial: 2,
  challenged_upheld: 3,
  not_challenged: 4,
};

function deriveJudicialStatus(
  eoStatus: string,
  challenges: Array<{ outcome: string }>
): string {
  if (challenges.length === 0) return "not_challenged";
  const outcomes = challenges.map((c) => c.outcome);
  if (outcomes.includes("blocked")) return "challenged_blocked";
  if (outcomes.includes("overturned")) return "challenged_blocked";
  if (outcomes.includes("pending")) return "challenged_pending";
  if (outcomes.includes("partially_upheld")) return "challenged_partial";
  if (outcomes.includes("upheld")) return "challenged_upheld";
  return "challenged_pending";
}

function extractEoNumber(title: string): string {
  const match = title.match(/^(EO\s?\d+(?:\.\d+)?|Presidential Memorandum|Proclamation \d+)/i);
  if (match) return match[1];
  if (title.toLowerCase().startsWith("eo ")) return title.split(":")[0].trim();
  return "Executive Order";
}

router.get("/executive-orders/compare", async (req, res) => {
  try {
    const admins = await db.select().from(administrationsTable).orderBy(administrationsTable.startYear);
    const overreachAll = await db.select().from(overreachIncidentsTable);

    const result = admins.map((admin) => {
      const years = admin.endYear
        ? admin.endYear - admin.startYear + 1
        : Math.max(new Date().getFullYear() - admin.startYear + 1, 1);

      const adminOverreach = overreachAll.filter((o) => o.administration === admin.slug);
      const blocked = adminOverreach.filter((o) => o.outcome === "blocked" || o.outcome === "overturned").length;
      const upheld = adminOverreach.filter((o) => o.outcome === "upheld" || o.outcome === "partially_upheld").length;
      const pending = adminOverreach.filter((o) => o.outcome === "pending").length;
      const challenged = adminOverreach.length;
      const challengeRate = admin.executiveOrders > 0
        ? Math.round((challenged / admin.executiveOrders) * 1000) / 10
        : 0;

      return {
        administration: admin.slug,
        president: admin.president,
        party: admin.party,
        startYear: admin.startYear,
        endYear: admin.endYear ?? null,
        totalEOs: admin.executiveOrders,
        eosPerYear: Math.round((admin.executiveOrders / years) * 10) / 10,
        challengedEOs: challenged,
        blockedEOs: blocked,
        upheldEOs: upheld,
        pendingEOs: pending,
        challengeRate,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to compare executive orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/executive-orders", async (req, res) => {
  try {
    const parsed = ListExecutiveOrdersQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { administration, judicialStatus } = parsed.data;
    const targetAdmin = administration ?? "trump_2025";

    const eoActions = await db
      .select()
      .from(actionsTable)
      .then((rows) =>
        rows.filter(
          (r) =>
            r.administration === targetAdmin &&
            (r.category === "executive_order" ||
              r.category === "proclamation" ||
              r.supremeCourtChallenged === true ||
              r.title.toLowerCase().startsWith("eo "))
        )
      );

    const overreachRows = await db
      .select()
      .from(overreachIncidentsTable)
      .then((rows) => rows.filter((r) => r.administration === targetAdmin));

    const enriched = eoActions.map((eo) => {
      const titleWords = eo.title
        .toLowerCase()
        .replace(/^eo\s?\d+:\s*/i, "")
        .split(/\s+/)
        .filter((w) => w.length > 4);

      const challenges = overreachRows.filter((o) => {
        const oText = (o.title + " " + o.description + " " + o.significance).toLowerCase();
        return (
          titleWords.some((w) => oText.includes(w)) ||
          eo.supremeCourtChallenged === true
        );
      });

      const uniqueChallenges = Array.from(
        new Map(challenges.map((c) => [c.id, c])).values()
      );

      const judicialSt = deriveJudicialStatus(eo.status, uniqueChallenges);

      return {
        id: eo.id,
        eoNumber: extractEoNumber(eo.title),
        title: eo.title,
        date: eo.date,
        description: eo.description,
        administration: eo.administration,
        status: eo.status,
        significance: eo.significance ?? null,
        references: eo.references,
        judicialStatus: judicialSt,
        judicialChallenges: uniqueChallenges.map((c) => ({
          id: c.id,
          title: c.title,
          outcome: c.outcome,
          type: c.type,
          significance: c.significance,
        })),
      };
    });

    const sorted = enriched.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filtered =
      judicialStatus
        ? sorted.filter((e) => e.judicialStatus === judicialStatus)
        : sorted;

    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list executive orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
