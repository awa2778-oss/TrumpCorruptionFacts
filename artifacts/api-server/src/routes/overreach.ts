import { Router } from "express";
import { db, overreachIncidentsTable, administrationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListOverreachIncidentsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/overreach/stats", async (req, res) => {
  try {
    const incidents = await db.select().from(overreachIncidentsTable);
    const admins = await db.select().from(administrationsTable);

    const adminMap: Record<string, typeof admins[0]> = {};
    for (const a of admins) adminMap[a.slug] = a;

    const statMap: Record<string, {
      blocked: number; overturned: number; upheld: number; pending: number; partially_upheld: number;
      court_injunction: number; constitutional_challenge: number; statutory_overreach: number; congressional_rebuke: number; other: number;
    }> = {};

    for (const inc of incidents) {
      if (!statMap[inc.administration]) {
        statMap[inc.administration] = {
          blocked: 0, overturned: 0, upheld: 0, pending: 0, partially_upheld: 0,
          court_injunction: 0, constitutional_challenge: 0, statutory_overreach: 0, congressional_rebuke: 0, other: 0,
        };
      }
      const s = statMap[inc.administration];
      if (inc.outcome === "blocked") s.blocked++;
      else if (inc.outcome === "overturned") s.overturned++;
      else if (inc.outcome === "upheld") s.upheld++;
      else if (inc.outcome === "pending") s.pending++;
      else if (inc.outcome === "partially_upheld") s.partially_upheld++;

      if (inc.type === "court_injunction") s.court_injunction++;
      else if (inc.type === "constitutional_challenge") s.constitutional_challenge++;
      else if (inc.type === "statutory_overreach") s.statutory_overreach++;
      else if (inc.type === "congressional_rebuke") s.congressional_rebuke++;
      else s.other++;
    }

    const result = Object.entries(statMap).map(([slug, s]) => {
      const admin = adminMap[slug];
      return {
        administration: slug,
        president: admin?.president ?? slug,
        party: admin?.party ?? "Unknown",
        startYear: admin?.startYear ?? 0,
        totalIncidents: s.blocked + s.overturned + s.upheld + s.pending + s.partially_upheld,
        blocked: s.blocked,
        overturned: s.overturned,
        upheld: s.upheld,
        pending: s.pending,
        courtInjunctions: s.court_injunction,
        constitutionalChallenges: s.constitutional_challenge,
        statutoryOverreach: s.statutory_overreach,
        congressionalRebukes: s.congressional_rebuke,
      };
    }).sort((a, b) => a.startYear - b.startYear);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get overreach stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/overreach", async (req, res) => {
  try {
    const parsed = ListOverreachIncidentsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { administration, type } = parsed.data;
    let rows = await db.select().from(overreachIncidentsTable);

    if (administration) rows = rows.filter((r) => r.administration === administration);
    if (type) rows = rows.filter((r) => r.type === type);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list overreach incidents");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
