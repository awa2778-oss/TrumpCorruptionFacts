import { useMemo } from "react";
import {
  useListActions,
  useListRetributionActions,
  getListRetributionActionsQueryKey,
  useListSupremeCourtCases,
  useListOverreachIncidents,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, ScatterChart, Scatter, ZAxis, LineChart, Line, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LabelList,
} from "recharts";
import { TrendingUp, BarChart2, GitBranch, AlertTriangle, Scale } from "lucide-react";
import {
  calcAASI, calcRIS, calcCRR, calcPAG,
  CATEGORY_WEIGHTS, CONNECTION_TYPE_WEIGHTS,
} from "@/lib/agency-map";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FormulaBox({ formula, vars }: { formula: string; vars: Record<string, string> }) {
  return (
    <div className="border-4 border-border bg-muted/20 p-4 space-y-3 font-mono text-sm">
      <p className="text-base font-black text-primary break-words">{formula}</p>
      <div className="space-y-1">
        {Object.entries(vars).map(([k, v]) => (
          <p key={k} className="text-xs font-semibold text-muted-foreground">
            <span className="font-black text-foreground">{k}</span> = {v}
          </p>
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-black uppercase">
        <span className="truncate max-w-[70%]">{label}</span>
        <span style={{ color }}>{score}</span>
      </div>
      <div className="h-3 bg-muted border border-border w-full">
        <div className="h-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { data: adminActions } = useListActions({});
  const { data: retActions }   = useListRetributionActions(
    {},
    { query: { queryKey: getListRetributionActionsQueryKey({}) } }
  );
  const { data: scotusCases }  = useListSupremeCourtCases({});
  const { data: overreach }    = useListOverreachIncidents({});

  const loading = !adminActions || !retActions;

  // ── Computed datasets ───────────────────────────────────────────────────
  const computed = useMemo(() => {
    if (!adminActions || !retActions) return null;

    // 1. AASI scores for every admin action
    const aasi = (adminActions as any[]).map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      category: a.category,
      status: a.status,
      score: calcAASI({
        category: a.category,
        status: a.status,
        supreme_court_challenged: a.supremeCourtChallenged ?? a.supreme_court_challenged,
        factuality_rating: a.factualityRating ?? a.factuality_rating,
        date: a.date,
      }),
    })).sort((a, b) => b.score - a.score);

    // 2. RIS scores for every retribution action
    const ris = (retActions as any[]).map((r) => ({
      id: r.id,
      title: r.title,
      target: r.target,
      connType: r.connectionType ?? r.connection_type,
      years: r.relationshipYears ?? r.relationship_years ?? 0,
      outcome: r.outcome,
      score: calcRIS({
        connection_type: r.connectionType ?? r.connection_type,
        relationship_years: r.relationshipYears ?? r.relationship_years,
        outcome: r.outcome,
        judicial_response: r.judicialResponse ?? r.judicial_response,
      }),
    })).sort((a, b) => b.score - a.score);

    // 3. Court Resistance Ratio per category (admin actions)
    const byCategory = (adminActions as any[]).reduce<Record<string, any[]>>((acc, a) => {
      const c = a.category ?? "unknown";
      if (!acc[c]) acc[c] = [];
      acc[c].push(a);
      return acc;
    }, {});
    const crrByCategory = Object.entries(byCategory).map(([cat, acts]) => ({
      category: cat.replace(/_/g, " ").toUpperCase(),
      key: cat,
      total: acts.length,
      blocked: acts.filter((a) => a.status === "blocked" || a.status === "reversed").length,
      crr: calcCRR(acts.map((a) => ({ status: a.status }))),
      weight: Math.round((CATEGORY_WEIGHTS[cat] ?? 0.5) * 100),
    })).sort((a, b) => b.crr - a.crr);

    // 4. RIS by connection type
    const risByConn = Object.entries(
      (retActions as any[]).reduce<Record<string, number[]>>((acc, r) => {
        const k = (r.connectionType ?? r.connection_type ?? "unknown") as string;
        if (!acc[k]) acc[k] = [];
        acc[k].push(calcRIS({
          connection_type: r.connectionType ?? r.connection_type,
          relationship_years: r.relationshipYears ?? r.relationship_years,
          outcome: r.outcome,
          judicial_response: r.judicialResponse ?? r.judicial_response,
        }));
        return acc;
      }, {})
    ).map(([conn, scores]) => ({
      conn: conn.replace(/_/g, " ").toUpperCase(),
      avgRIS: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
      count: scores.length,
      weight: Math.round((CONNECTION_TYPE_WEIGHTS[conn] ?? 0.5) * 100),
    })).sort((a, b) => b.avgRIS - a.avgRIS);

    // 5. Temporal velocity — actions per calendar month
    const monthMap: Record<string, number> = {};
    (adminActions as any[]).forEach((a) => {
      const m = (a.date ?? "").slice(0, 7);
      if (m) monthMap[m] = (monthMap[m] ?? 0) + 1;
    });
    const velocity = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count], i, arr) => ({
        month,
        count,
        cumulative: arr.slice(0, i + 1).reduce((s, [, c]) => s + c, 0),
      }));

    // 6. Presidential Accountability Gap
    const courtBlocked = (adminActions as any[]).filter(
      (a) => a.status === "blocked" || a.status === "reversed"
    ).length;
    const pag = calcPAG((retActions as any[]).length, courtBlocked);

    // 7. Scatter: AASI score vs category weight
    const scatter = aasi.map((a) => ({
      x: Math.round((CATEGORY_WEIGHTS[a.category] ?? 0.5) * 100),
      y: a.score,
      z: a.status === "blocked" ? 60 : 30,
      label: a.title.slice(0, 30),
      status: a.status,
    }));

    // 8. Radar — cross-domain impact
    const domainScores = [
      { domain: "Civil Liberties", score: aasi.filter((a) => ["immigration", "policy"].includes(a.category)).reduce((s, a) => s + a.score, 0) / Math.max(1, aasi.filter((a) => ["immigration", "policy"].includes(a.category)).length) },
      { domain: "Economy / Trade", score: aasi.filter((a) => ["tariff", "deregulation"].includes(a.category)).reduce((s, a) => s + a.score, 0) / Math.max(1, aasi.filter((a) => ["tariff", "deregulation"].includes(a.category)).length) },
      { domain: "Rule of Law",     score: Math.round((ris.reduce((s, r) => s + r.score, 0) / Math.max(1, ris.length))) },
      { domain: "Foreign Policy",  score: aasi.filter((a) => a.category === "foreign_policy").reduce((s, a) => s + a.score, 0) / Math.max(1, aasi.filter((a) => a.category === "foreign_policy").length) },
      { domain: "Court Resistance", score: Math.round(((scotusCases as any[] ?? []).filter((c) => (c.status ?? "").toLowerCase().includes("block") || (c.administrationPosition ?? c.administration_position ?? "")).length / Math.max(1, (scotusCases as any[] ?? []).length)) * 100) },
      { domain: "Retribution",     score: Math.round(ris.slice(0, 5).reduce((s, r) => s + r.score, 0) / 5) },
    ].map((d) => ({ ...d, score: Math.round(d.score) }));

    // 9. Score distribution buckets
    const allScores = [...aasi.map((a) => a.score), ...ris.map((r) => r.score)];
    const buckets = [
      { range: "0–20",   min: 0,  max: 20,  count: 0 },
      { range: "21–40",  min: 21, max: 40,  count: 0 },
      { range: "41–60",  min: 41, max: 60,  count: 0 },
      { range: "61–80",  min: 61, max: 80,  count: 0 },
      { range: "81–100", min: 81, max: 100, count: 0 },
    ];
    allScores.forEach((s) => {
      const b = buckets.find((bk) => s >= bk.min && s <= bk.max);
      if (b) b.count++;
    });

    return { aasi, ris, crrByCategory, risByConn, velocity, pag, scatter, domainScores, buckets, courtBlocked };
  }, [adminActions, retActions, scotusCases]);

  if (loading || !computed) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full" />
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
      </div>
    );
  }

  const { aasi, ris, crrByCategory, risByConn, velocity, pag, scatter, domainScores, buckets } = computed;

  return (
    <div className="p-8 space-y-14 max-w-7xl mx-auto">

      {/* Header */}
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-start gap-4">
          <BarChart2 className="w-12 h-12 text-primary shrink-0 mt-2" strokeWidth={3} />
          <div>
            <h1 className="text-5xl md:text-6xl tracking-wider uppercase drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
              Data Analytics
            </h1>
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Mathematical algorithms scoring every action, retribution, and judicial challenge
            </p>
          </div>
        </div>
      </header>

      {/* Key metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Actions Scored",       value: aasi.length + ris.length, color: "bg-foreground text-background" },
          { label: "Avg AASI",             value: Math.round(aasi.reduce((s,a)=>s+a.score,0)/aasi.length), color: "bg-destructive text-white" },
          { label: "Avg RIS",              value: Math.round(ris.reduce((s,r)=>s+r.score,0)/ris.length), color: "bg-purple-700 text-white" },
          { label: "Court Resistance",     value: `${Math.round((computed.courtBlocked/(aasi.length||1))*100)}%`, color: "bg-blue-700 text-white" },
          { label: "Accountability Gap",   value: `${pag}×`, color: "bg-orange-600 text-white" },
        ].map((s) => (
          <Card key={s.label} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <CardHeader className={`border-b-4 border-border py-2 px-3 ${s.color}`}>
              <CardTitle className="text-xs uppercase tracking-widest font-bold">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <p className="text-4xl font-black tracking-wider">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══════════ ALGORITHM 1: AASI ═══════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 border-destructive pb-3">
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
            Algorithm 1 — Administration Action Severity Index (AASI)
          </h2>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-1">
            Composite 0–100 score quantifying the real-world impact severity of each administration action
          </p>
        </div>

        <FormulaBox
          formula="AASI = (cat_weight × 30) + (status_mult × 30) + (court_bonus × 20) + (factuality_adj × 10) + (recency × 10)"
          vars={{
            "cat_weight":     "immigration=1.0 · executive_order=0.9 · foreign_policy=0.88 · tariff=0.8 · deregulation=0.72 · policy=0.6 · proclamation=0.4",
            "status_mult":    "enacted=1.0 · pending=0.7 · blocked=0.35 · reversed=0.1",
            "court_bonus":    "20 pts if SCOTUS challenged, else 0",
            "factuality_adj": "true=+5 · mixed=0 · false/misleading=−5 to −10 (normalized 0–10)",
            "recency":        "< 30 days = 10 · < 90 days = 6 · < 180 days = 3 · older = 1",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 AASI chart */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(204,0,0,1)]">
            <CardHeader className="border-b-4 border-border bg-destructive text-white">
              <CardTitle className="text-base uppercase tracking-wider">Top 10 Highest AASI Scores</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={aasi.slice(0,10)} margin={{ top:5, right:55, left:10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <YAxis type="category" dataKey="title" width={200}
                    tick={{ fontSize:9, fontWeight:900, fill:"hsl(var(--foreground))" }}
                    tickFormatter={(t:string) => t.length > 26 ? t.slice(0,24)+"…" : t} />
                  <Tooltip
                    contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                    formatter={(v:number) => [v, "AASI Score"]}
                    labelFormatter={(l:string) => aasi.find(a=>a.title===l)?.title ?? l}
                  />
                  <Bar dataKey="score" stroke="hsl(var(--border))" strokeWidth={1}>
                    {aasi.slice(0,10).map((a,i) => (
                      <Cell key={i} fill={a.score>=80?"#CC0000":a.score>=60?"#EA580C":"#D97706"} />
                    ))}
                    <LabelList dataKey="score" position="right"
                      style={{ fontSize:11, fontWeight:900, fill:"hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score distribution */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]">
            <CardHeader className="border-b-4 border-border bg-foreground text-background">
              <CardTitle className="text-base uppercase tracking-wider">Score Distribution — All Actions</CardTitle>
              <p className="text-xs font-bold uppercase opacity-70">AASI + RIS combined across {aasi.length + ris.length} scored items</p>
            </CardHeader>
            <CardContent className="p-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buckets} margin={{ top:20, right:20, left:10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize:11, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <YAxis tick={{ fontSize:11, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:12 }}
                    formatter={(v:number) => [v, "Actions"]} />
                  <Bar dataKey="count" fill="#CC0000" stroke="#7f1d1d" strokeWidth={2}>
                    <LabelList dataKey="count" position="top" style={{ fontWeight:900, fontSize:13 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* All AASI scores as progress bars */}
        <Card className="border-4 border-border rounded-none">
          <CardHeader className="border-b-4 border-border bg-muted/30">
            <CardTitle className="text-sm uppercase tracking-wider">All {aasi.length} Administration Actions — AASI Score</CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {aasi.map((a) => (
              <ScoreBar key={a.id} label={a.title} score={a.score}
                color={a.score>=80?"#CC0000":a.score>=60?"#EA580C":a.score>=40?"#D97706":"#6b7280"} />
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ═══════════ ALGORITHM 2: RIS ════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 pb-3" style={{ borderColor:"#7C3AED" }}>
          <h2 className="text-3xl uppercase tracking-wider" style={{ textShadow:"3px 3px 0px #7C3AED" }}>
            Algorithm 2 — Retribution Intensity Score (RIS)
          </h2>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-1">
            Quantifies severity of each retribution action combining relationship depth, connection type, and outcome
          </p>
        </div>

        <FormulaBox
          formula="RIS = (years_factor × 30) + (conn_weight × 35) + (outcome_sev × 25) + (judicial_factor × 10)"
          vars={{
            "years_factor":    "min(relationship_years / 40, 1.0) — normalizes up to 40 years",
            "conn_weight":     "investigator=1.0 · legal_adversary=0.9 · appointed=0.85 · political_opponent=0.7 · critic=0.6 · institutional=0.5",
            "outcome_sev":     "enacted=1.0 · pending=0.7 · ongoing=0.65 · blocked=0.35 · reversed=0.1",
            "judicial_factor": "10 pts if court issued a response/ruling, else 0",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RIS top 10 */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(124,58,237,1)]">
            <CardHeader className="border-b-4 bg-purple-700 text-white" style={{ borderColor:"#5b21b6" }}>
              <CardTitle className="text-base uppercase tracking-wider">Top 10 Highest RIS Scores</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={ris.slice(0,10)} margin={{ top:5, right:55, left:10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <YAxis type="category" dataKey="target" width={170}
                    tick={{ fontSize:9, fontWeight:900, fill:"hsl(var(--foreground))" }}
                    tickFormatter={(t:string) => t.length > 22 ? t.slice(0,20)+"…" : t} />
                  <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                    formatter={(v:number) => [v, "RIS Score"]} />
                  <Bar dataKey="score" fill="#7C3AED" stroke="#5b21b6" strokeWidth={2}>
                    <LabelList dataKey="score" position="right"
                      style={{ fontSize:11, fontWeight:900, fill:"hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* RIS by connection type */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(124,58,237,0.5)]">
            <CardHeader className="border-b-4 bg-purple-900 text-white" style={{ borderColor:"#3b0764" }}>
              <CardTitle className="text-base uppercase tracking-wider">Avg RIS by Connection Type</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={risByConn} margin={{ top:5, right:55, left:10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0,100]} tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <YAxis type="category" dataKey="conn" width={165}
                    tick={{ fontSize:9, fontWeight:900, fill:"hsl(var(--foreground))" }} />
                  <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                    formatter={(v:number, name:string) => [name==="avgRIS"?v+" score":v, name==="avgRIS"?"Avg RIS":"Count"]} />
                  <Bar dataKey="avgRIS" fill="#A855F7" stroke="#7C3AED" strokeWidth={2}>
                    <LabelList dataKey="avgRIS" position="right"
                      style={{ fontSize:11, fontWeight:900, fill:"hsl(var(--foreground))" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════ ALGORITHM 3: CRR ════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 border-blue-700 pb-3">
          <h2 className="text-3xl uppercase tracking-wider" style={{ textShadow:"3px 3px 0px #1d4ed8" }}>
            Algorithm 3 — Court Resistance Ratio (CRR)
          </h2>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-1">
            Proportion of actions per category blocked or reversed by courts
          </p>
        </div>

        <FormulaBox
          formula="CRR(category) = (blocked_count + reversed_count) / total_in_category × 100"
          vars={{
            "blocked_count":  "Actions halted by court order or injunction",
            "reversed_count": "Actions implemented then struck down or reversed",
            "total":          "All tracked actions in that category",
            "Interpretation": "Higher CRR = courts more likely to push back on this category of action",
          }}
        />

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(29,78,216,1)]">
          <CardHeader className="border-b-4 bg-blue-700 text-white" style={{ borderColor:"#1e3a8a" }}>
            <CardTitle className="text-base uppercase tracking-wider">Court Resistance Ratio (%) + Category Weight</CardTitle>
            <p className="text-xs font-bold uppercase opacity-80">Red = % blocked/reversed · Gray = category impact weight (scaled)</p>
          </CardHeader>
          <CardContent className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crrByCategory} margin={{ top:5, right:20, left:10, bottom:20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize:9, fontWeight:"bold", fill:"hsl(var(--foreground))" } as any} />
                <YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`}
                  tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                  formatter={(v:number, name:string) => [
                    name==="crr" ? `${v}%` : `${v}/100`,
                    name==="crr" ? "Court Resistance %" : "Impact Weight",
                  ]} />
                <ReferenceLine y={50} stroke="#CC0000" strokeDasharray="4 2"
                  label={{ value:"50% threshold", position:"right", fontSize:9, fill:"#CC0000" }} />
                <Bar dataKey="crr"    name="crr"    fill="#CC0000" stroke="#7f1d1d" strokeWidth={2} />
                <Bar dataKey="weight" name="weight" fill="#6b7280" stroke="#374151" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════ ALGORITHM 4: Temporal Velocity ══════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 border-amber-600 pb-3">
          <h2 className="text-3xl uppercase tracking-wider" style={{ textShadow:"3px 3px 0px #d97706" }}>
            Algorithm 4 — Temporal Velocity &amp; Cumulative Impact
          </h2>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-1">
            Rate of actions over time — is the pace accelerating, stable, or decelerating?
          </p>
        </div>

        <FormulaBox
          formula="TV(month) = actions_this_month · CumulativeImpact(t) = Σ AASI(i) for all i ≤ t"
          vars={{
            "TV > prior_month":  "Accelerating — executive action pace is increasing",
            "TV = prior_month":  "Stable — consistent pace of executive action",
            "TV < prior_month":  "Decelerating — pace slowing (often due to court injunctions)",
            "Cumulative Impact": "Running total of AASI scores — shows aggregate damage/impact accumulation over time",
          }}
        />

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(217,119,6,1)]">
          <CardHeader className="border-b-4 bg-amber-600 text-black" style={{ borderColor:"#92400e" }}>
            <CardTitle className="text-base uppercase tracking-wider">Actions per Month · Cumulative Total</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocity} margin={{ top:10, right:30, left:10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <YAxis yAxisId="left" tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                  formatter={(v:number, name:string) => [v, name==="count"?"Actions this month":"Cumulative total"]} />
                <Line yAxisId="left"  type="monotone" dataKey="count"      stroke="#D97706" strokeWidth={3} dot={{ r:5, fill:"#D97706" }} name="count" />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#CC0000" strokeWidth={2} strokeDasharray="5 3" dot={false} name="cumulative" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ═══════════ ALGORITHM 5: PAG + Radar ════════════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 border-border pb-3">
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
            Algorithms 5 &amp; 6 — Accountability Gap &amp; Cross-Domain Radar
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PAG callout */}
          <div className="space-y-4">
            <FormulaBox
              formula="PAG = retribution_actions / (court_blocked + reversed + 1)"
              vars={{
                "Interpretation": "How many retaliation actions exist per court check on executive power",
                "PAG > 3":        "Retribution significantly outpaces accountability",
                "PAG < 1":        "Courts are keeping up with retributive actions",
                "Current PAG":    String(pag) + "× — " + (pag > 3 ? "retribution far outpaces judicial accountability" : pag > 1.5 ? "moderately elevated" : "within normal range"),
              }}
            />
            <Card className="border-4 border-destructive rounded-none bg-destructive/5">
              <CardContent className="p-6 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-destructive mb-2">Presidential Accountability Gap</p>
                <p className="text-8xl font-black" style={{ color: pag > 3 ? "#CC0000" : pag > 1.5 ? "#EA580C" : "#059669" }}>
                  {pag}×
                </p>
                <p className="text-sm font-bold uppercase text-muted-foreground mt-2">
                  {ris.length} retribution actions per {computed.courtBlocked} court blocks/reversals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cross-domain radar */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]">
            <CardHeader className="border-b-4 border-border bg-foreground text-background">
              <CardTitle className="text-base uppercase tracking-wider">Cross-Domain Impact Radar</CardTitle>
              <p className="text-xs font-bold uppercase opacity-70">Avg severity score across 6 impact domains</p>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={domainScores} margin={{ top:10, right:30, bottom:10, left:30 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="domain"
                    tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                  <Radar dataKey="score" stroke="#CC0000" fill="#CC0000" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                    formatter={(v:number) => [v, "Avg Severity"]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════ Scatter: Category weight vs AASI ════════════════════════ */}
      <section className="space-y-6">
        <div className="border-b-4 border-border pb-3">
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
            Scatter Analysis — Expected vs. Actual Severity
          </h2>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-1">
            X-axis: category impact weight · Y-axis: computed AASI score · Size: blocked = larger dot
          </p>
        </div>
        <Card className="border-4 border-border rounded-none">
          <CardContent className="p-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top:20, right:20, left:10, bottom:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="x" name="Category Weight" domain={[35,105]}
                  label={{ value:"Category Weight (0–100)", position:"insideBottom", offset:-5, fontSize:10, fontWeight:"bold" }}
                  tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <YAxis type="number" dataKey="y" name="AASI Score" domain={[0,100]}
                  label={{ value:"AASI Score", angle:-90, position:"insideLeft", fontSize:10, fontWeight:"bold" }}
                  tick={{ fontSize:10, fontWeight:"bold", fill:"hsl(var(--foreground))" }} />
                <ZAxis type="number" dataKey="z" range={[20, 80]} />
                <Tooltip
                  cursor={{ strokeDasharray:"3 3" }}
                  contentStyle={{ border:"4px solid hsl(var(--border))", borderRadius:0, fontWeight:"bold", fontSize:11 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-background border-4 border-border p-2 text-xs font-bold uppercase">
                        <p>{d.label}</p>
                        <p>Weight: {d.x} · Score: {d.y}</p>
                        <p className={d.status==="blocked"?"text-destructive":"text-emerald-600"}>
                          {d.status?.toUpperCase()}
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={scatter}
                  fill="#CC0000"
                >
                  {scatter.map((s, i) => (
                    <Cell key={i} fill={s.status==="blocked"?"#1D4ED8":s.status==="reversed"?"#059669":"#CC0000"} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="border-t-4 border-border px-4 py-2 bg-muted/20 flex flex-wrap gap-4 text-xs font-bold uppercase">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-destructive" /> Enacted</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-blue-700" /> Blocked by court</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-emerald-600" /> Reversed</span>
          </div>
        </Card>
      </section>

    </div>
  );
}
