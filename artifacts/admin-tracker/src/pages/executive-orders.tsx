import { useState } from "react";
import {
  useListExecutiveOrders,
  getListExecutiveOrdersQueryKey,
  useCompareExecutiveOrders,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";
import { ExternalLink, FileText, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldX, Newspaper } from "lucide-react";

const JUDICIAL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  not_challenged:      { label: "Not Challenged",   color: "text-green-700",   bg: "bg-green-700 text-white border-green-800" },
  challenged_blocked:  { label: "Blocked by Court", color: "text-destructive", bg: "bg-destructive text-destructive-foreground" },
  challenged_upheld:   { label: "Court Upheld",     color: "text-green-700",   bg: "bg-green-700 text-white" },
  challenged_pending:  { label: "Challenge Pending", color: "text-yellow-600", bg: "bg-yellow-500 text-black" },
  challenged_partial:  { label: "Partially Upheld", color: "text-amber-600",   bg: "bg-amber-500 text-black" },
};

const STATUS_CONFIG: Record<string, string> = {
  enacted:        "bg-secondary text-secondary-foreground",
  blocked:        "bg-destructive text-destructive-foreground",
  pending:        "bg-yellow-500 text-black",
  enacted_paused: "bg-amber-500 text-black",
};

const FACTUALITY_CONFIG: Record<string, { label: string; bg: string; border: string; icon: typeof ShieldCheck; hex: string }> = {
  high:   { label: "High Factuality",   bg: "bg-green-700 text-white",    border: "border-green-800",   icon: ShieldCheck, hex: "#15803d" },
  mixed:  { label: "Mixed Factuality",  bg: "bg-amber-500 text-black",    border: "border-amber-600",   icon: ShieldAlert, hex: "#d97706" },
  low:    { label: "Low Factuality",    bg: "bg-destructive text-destructive-foreground", border: "border-red-800", icon: ShieldX,    hex: "#cc0000" },
  unrated:{ label: "Unrated",           bg: "bg-muted text-foreground",   border: "border-border",      icon: ShieldAlert, hex: "#6b7280" },
};

const ADMIN_SHORT: Record<string, string> = {
  trump_2025: "Trump '25", trump_2017: "Trump '17", biden: "Biden",
  obama: "Obama", bush_jr: "Bush Jr.", clinton: "Clinton",
  bush_sr: "Bush Sr.", reagan: "Reagan",
};

type EoItem = NonNullable<ReturnType<typeof useListExecutiveOrders>["data"]>[number];

function GroundNewsTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-[#1a1a2e] text-white border-2 border-[#e94560]">
      <Newspaper className="w-3 h-3" />
      Ground News
    </span>
  );
}

function EoCard({ eo }: { eo: EoItem }) {
  const [expanded, setExpanded] = useState(false);
  if (!eo) return null;

  const jsCfg  = JUDICIAL_STATUS_CONFIG[eo.judicialStatus] ?? JUDICIAL_STATUS_CONFIG.not_challenged;
  const facCfg = FACTUALITY_CONFIG[(eo.factualityRating as string) ?? "unrated"] ?? FACTUALITY_CONFIG.unrated;
  const FacIcon = facCfg.icon;

  const refs = Array.isArray(eo.references)
    ? (eo.references as Array<{ title: string; url: string; source: string }>)
    : [];
  const groundNewsRefs = refs.filter((r) => r.source === "Ground News");
  const factCheckRefs  = refs.filter((r) => ["AP Fact Check", "PolitiFact", "Reuters Fact Check", "Reuters", "FactCheck.org", "Brookings Institution", "AP News"].includes(r.source));
  const otherRefs      = refs.filter((r) => r.source !== "Ground News" && !["AP Fact Check", "PolitiFact", "Reuters Fact Check", "Reuters", "FactCheck.org", "Brookings Institution", "AP News"].includes(r.source));

  return (
    <Card
      data-testid={`eo-card-${eo.id}`}
      className="border-4 border-border rounded-none shadow-[5px_5px_0px_0px_hsl(var(--border))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] transition-shadow"
    >
      <CardHeader
        className="border-b-4 border-border pb-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="shrink-0 font-display text-xs uppercase tracking-wider bg-foreground text-background px-2 py-1 border-2 border-border whitespace-nowrap">
              {eo.eoNumber}
            </span>
            <CardTitle className="text-base md:text-lg uppercase tracking-wide leading-snug">
              {eo.title.replace(/^EO\s?\d+:\s*/i, "")}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 items-center">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 ${facCfg.bg} ${facCfg.border}`}>
              <FacIcon className="w-3 h-3" />
              {facCfg.label}
            </span>
            <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border ${jsCfg.bg}`}>
              {jsCfg.label}
            </span>
            <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border ${STATUS_CONFIG[eo.status] ?? "bg-muted text-foreground"}`}>
              {eo.status}
            </span>
            <span className="text-xs font-mono font-bold text-muted-foreground">{eo.date}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-5 space-y-4">
          <p className="text-sm leading-relaxed">{eo.description}</p>

          {eo.significance && (
            <div className="border-l-4 border-primary pl-4 bg-primary/5 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Significance</p>
              <p className="text-sm font-semibold">{eo.significance}</p>
            </div>
          )}

          {/* Factuality section */}
          {eo.factualityRating && (
            <div className={`border-l-4 pl-4 py-2 space-y-1 ${
              eo.factualityRating === "high"  ? "border-green-700 bg-green-50 dark:bg-green-950/20" :
              eo.factualityRating === "mixed" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" :
              "border-destructive bg-destructive/5"
            }`}>
              <div className="flex items-center gap-2">
                <FacIcon className={`w-4 h-4 ${
                  eo.factualityRating === "high" ? "text-green-700" :
                  eo.factualityRating === "mixed" ? "text-amber-600" : "text-destructive"
                }`} />
                <p className="text-xs font-black uppercase tracking-wider">
                  {facCfg.label} — rated by {eo.factualitySource}
                </p>
              </div>
              {eo.factualityNotes && (
                <p className="text-sm leading-relaxed font-medium">{eo.factualityNotes}</p>
              )}
            </div>
          )}

          {/* Ground News coverage */}
          {groundNewsRefs.length > 0 && (
            <div className="border-4 border-[#e94560] bg-[#1a1a2e]/5 p-3 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#e94560]" />
                Ground News Coverage — multi-source, Left/Center/Right
              </p>
              <div className="flex flex-wrap gap-2">
                {groundNewsRefs.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`eo-gn-${eo.id}-${idx}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase border-2 border-[#e94560] bg-[#1a1a2e] text-white hover:bg-[#e94560] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Ground News
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Fact-checker references */}
          {factCheckRefs.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fact-Checker Sources</p>
              <div className="flex flex-wrap gap-2">
                {factCheckRefs.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`eo-fc-${eo.id}-${idx}`}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 transition-colors ${
                      eo.factualityRating === "high"  ? "border-green-700 bg-green-700 text-white hover:bg-green-800" :
                      eo.factualityRating === "mixed" ? "border-amber-600 bg-amber-500 text-black hover:bg-amber-600" :
                      "border-red-800 bg-destructive text-destructive-foreground hover:opacity-80"
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {ref.source}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Judicial challenges */}
          {eo.judicialChallenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Judicial Challenges</p>
              {eo.judicialChallenges.map((ch) => (
                <div key={ch.id} className="border-l-4 border-destructive pl-4 bg-destructive/5 py-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold uppercase">{ch.title}</p>
                    <span className={`text-xs px-1 py-0.5 font-bold uppercase border border-border ${JUDICIAL_STATUS_CONFIG["challenged_" + ch.outcome]?.bg ?? "bg-muted text-foreground"}`}>
                      {ch.outcome.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs px-1 py-0.5 font-bold uppercase bg-secondary text-secondary-foreground border border-border">
                      {ch.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ch.significance}</p>
                </div>
              ))}
            </div>
          )}

          {/* Other source references */}
          {otherRefs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {otherRefs.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`eo-ref-${eo.id}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {ref.source}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const FACTUALITY_PIE_COLORS = { high: "#15803d", mixed: "#d97706", low: "#cc0000", unrated: "#6b7280" };

export default function ExecutiveOrdersPage() {
  const [filterStatus, setFilterStatus]       = useState<string>("");
  const [filterFactuality, setFilterFactuality] = useState<string>("");
  const [searchTerm, setSearchTerm]           = useState<string>("");

  const { data: eos, isLoading: eosLoading } = useListExecutiveOrders(
    { administration: "trump_2025", judicialStatus: filterStatus || undefined },
    { query: { queryKey: getListExecutiveOrdersQueryKey({ administration: "trump_2025", judicialStatus: filterStatus || undefined }) } }
  );
  const { data: comparison, isLoading: compLoading } = useCompareExecutiveOrders();

  const filtered = eos?.filter((eo) => {
    const matchesSearch = searchTerm
      ? eo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eo.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesFact = filterFactuality
      ? (eo.factualityRating ?? "unrated") === filterFactuality
      : true;
    return matchesSearch && matchesFact;
  });

  const challengedCount    = eos?.filter((e) => e.judicialStatus !== "not_challenged").length ?? 0;
  const blockedCount       = eos?.filter((e) => e.judicialStatus === "challenged_blocked").length ?? 0;
  const notChallengedCount = eos?.filter((e) => e.judicialStatus === "not_challenged").length ?? 0;

  // Factuality breakdown
  const factualityCounts = eos
    ? Object.entries(
        eos.reduce<Record<string, number>>((acc, eo) => {
          const k = (eo.factualityRating as string) ?? "unrated";
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value, fill: FACTUALITY_PIE_COLORS[name as keyof typeof FACTUALITY_PIE_COLORS] ?? "#6b7280" }))
    : [];

  const highCount  = eos?.filter((e) => e.factualityRating === "high").length  ?? 0;
  const mixedCount = eos?.filter((e) => e.factualityRating === "mixed").length ?? 0;
  const lowCount   = eos?.filter((e) => e.factualityRating === "low").length   ?? 0;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-center gap-4 mb-4">
          <FileText className="w-12 h-12 text-primary shrink-0" strokeWidth={3} />
          <h1 className="text-5xl md:text-7xl tracking-wider uppercase text-foreground drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
            Executive Orders
          </h1>
        </div>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          All EOs since January 20, 2025 — judicial outcomes · factuality ratings · Ground News coverage
        </p>
      </header>

      {/* Stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total EOs Tracked",    value: eos?.length ?? "—",  color: "bg-foreground text-background" },
          { label: "Judicially Challenged", value: challengedCount,      color: "bg-destructive text-destructive-foreground" },
          { label: "Blocked by Courts",     value: blockedCount,          color: "bg-orange-600 text-white" },
          { label: "Not Challenged",        value: notChallengedCount,    color: "bg-secondary text-secondary-foreground" },
        ].map((s) => (
          <Card key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]">
            <CardHeader className={`border-b-4 border-border py-3 px-4 ${s.color}`}>
              <CardTitle className="text-xs uppercase tracking-widest font-bold">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-5xl tracking-wider">{s.value}</p>
              <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Trump 2025</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── FACTUALITY SECTION ── */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          Factuality Ratings — Cross-Referenced with Fact-Checkers
        </h2>

        <div className="border-4 border-border p-4 bg-muted/30 text-sm font-semibold leading-relaxed">
          Each rating reflects published assessments by <strong>AP Fact Check</strong>, <strong>PolitiFact</strong>,{" "}
          <strong>Reuters Fact Check</strong>, and <strong>FactCheck.org</strong> — all rated center-leaning,
          high-factuality sources on Ground News. Ratings apply to the factual accuracy of the order's stated
          rationale, not its political merits.
          <span className="ml-2 inline-flex gap-1 flex-wrap">
            <GroundNewsTag />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black uppercase border-2 border-green-800 bg-green-700 text-white">AP · PolitiFact · Reuters</span>
          </span>
        </div>

        {eosLoading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Factuality count bar */}
            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--border))]">
              <CardHeader className="border-b-4 border-border bg-foreground text-background">
                <CardTitle className="text-xl uppercase tracking-wider">Factuality Distribution (of 20 EOs)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: "High Factuality",  count: highCount,  fill: "#15803d" },
                      { name: "Mixed Factuality", count: mixedCount, fill: "#d97706" },
                      { name: "Low Factuality",   count: lowCount,   fill: "#cc0000" },
                    ]}
                    margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} domain={[0, 12]} tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: 11, fill: "hsl(var(--foreground))", textTransform: "uppercase" }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                      formatter={(v) => [v, "EOs"]}
                    />
                    <Bar dataKey="count" stroke="hsl(var(--border))" strokeWidth={2} radius={0}
                      label={{ position: "right", fontWeight: 900, fontSize: 14, fontFamily: "var(--font-sans)", fill: "hsl(var(--foreground))" }}>
                      {[
                        { fill: "#15803d" },
                        { fill: "#d97706" },
                        { fill: "#cc0000" },
                      ].map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Factuality × Judicial status bar */}
            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))]">
              <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
                <CardTitle className="text-xl uppercase tracking-wider">Factuality × Court Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={["high", "mixed", "low"].map((r) => {
                      const group = eos?.filter((e) => (e.factualityRating ?? "unrated") === r) ?? [];
                      return {
                        name: FACTUALITY_CONFIG[r].label,
                        "Not Challenged": group.filter((e) => e.judicialStatus === "not_challenged").length,
                        "Pending":        group.filter((e) => e.judicialStatus === "challenged_pending").length,
                        "Blocked":        group.filter((e) => e.judicialStatus === "challenged_blocked").length,
                        fill: FACTUALITY_PIE_COLORS[r],
                      };
                    })}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--foreground))" }} />
                    <YAxis tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                    />
                    <Legend wrapperStyle={{ fontWeight: "bold", textTransform: "uppercase", fontSize: 11 }} />
                    <Bar dataKey="Not Challenged" stackId="a" fill="#15803d" stroke="hsl(var(--border))" strokeWidth={1} />
                    <Bar dataKey="Pending"        stackId="a" fill="#d97706" stroke="hsl(var(--border))" strokeWidth={1} />
                    <Bar dataKey="Blocked"        stackId="a" fill="#cc0000" stroke="hsl(var(--border))" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Factuality quick-stat cards */}
            {[
              { key: "high",  label: "High Factuality",  count: highCount,  desc: "Stated rationale confirmed by fact-checkers",        cfg: FACTUALITY_CONFIG.high  },
              { key: "mixed", label: "Mixed Factuality",  count: mixedCount, desc: "Partially supported; key claims disputed",           cfg: FACTUALITY_CONFIG.mixed },
              { key: "low",   label: "Low Factuality",    count: lowCount,   desc: "Core claims rated False or Mostly False",            cfg: FACTUALITY_CONFIG.low   },
            ].map((s) => {
              const Icon = s.cfg.icon;
              return (
                <Card
                  key={s.key}
                  data-testid={`factuality-stat-${s.key}`}
                  onClick={() => setFilterFactuality(filterFactuality === s.key ? "" : s.key)}
                  className={`border-4 rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))] cursor-pointer transition-transform hover:scale-105 ${filterFactuality === s.key ? "ring-4 ring-offset-2 ring-border" : ""}`}
                >
                  <CardHeader className={`border-b-4 border-border py-3 px-4 ${s.cfg.bg}`}>
                    <CardTitle className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {s.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-5xl tracking-wider">{s.count}</p>
                    <p className="text-xs font-bold uppercase text-muted-foreground mt-1">{s.desc}</p>
                    <p className="text-xs font-bold uppercase text-primary mt-1">{filterFactuality === s.key ? "Click to clear filter" : "Click to filter"}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── COMPARISON CHARTS ── */}
      {compLoading ? (
        <Skeleton className="h-[440px] w-full" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
            <CardHeader className="border-b-4 border-border bg-secondary text-secondary-foreground">
              <CardTitle className="text-xl uppercase tracking-wider">Executive Orders per Year — All Administrations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparison?.map((c) => ({ name: ADMIN_SHORT[c.administration] ?? c.president, "EOs / Year": c.eosPerYear }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--foreground))" }} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }} />
                  <Bar dataKey="EOs / Year" stroke="hsl(var(--border))" strokeWidth={2} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))]">
            <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
              <CardTitle className="text-xl uppercase tracking-wider">EOs Challenged vs Blocked by Courts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparison?.map((c) => ({ name: ADMIN_SHORT[c.administration] ?? c.president, Challenged: c.challengedEOs, Blocked: c.blockedEOs, Pending: c.pendingEOs }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--foreground))" }} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }} />
                  <Legend wrapperStyle={{ fontWeight: "bold", textTransform: "uppercase" }} />
                  <Bar dataKey="Challenged" fill="hsl(var(--foreground))" stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar dataKey="Blocked"    fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar dataKey="Pending"    fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── EO LIST ── */}
      <section className="space-y-5">
        <div className="border-b-8 border-border pb-4">
          <h2 className="text-4xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)] mb-4">
            All Trump 2025 Executive Orders
          </h2>
          <div className="flex flex-wrap gap-3">
            <input
              data-testid="eo-search"
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm flex-1 min-w-[200px]"
            />
            <select
              data-testid="eo-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">All Judicial Statuses</option>
              {Object.entries(JUDICIAL_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              data-testid="eo-filter-factuality"
              value={filterFactuality}
              onChange={(e) => setFilterFactuality(e.target.value)}
              className="border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">All Factuality Ratings</option>
              <option value="high">High Factuality</option>
              <option value="mixed">Mixed Factuality</option>
              <option value="low">Low Factuality</option>
            </select>
          </div>
          {filtered && (
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-2">
              Showing {filtered.length} order{filtered.length !== 1 ? "s" : ""} — click any card to expand
            </p>
          )}
        </div>

        {eosLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered?.map((eo) => <EoCard key={eo.id} eo={eo} />)}
            {filtered?.length === 0 && (
              <div className="border-4 border-border p-12 text-center">
                <p className="font-bold text-xl uppercase text-muted-foreground">No executive orders match the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
