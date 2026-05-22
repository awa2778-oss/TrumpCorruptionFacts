import { useState } from "react";
import {
  useListRetributionActions,
  getListRetributionActionsQueryKey,
  useGetRetributionStats,
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
  Cell,
} from "recharts";
import { ExternalLink, Target, ChevronDown, ChevronUp } from "lucide-react";

const TARGET_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  individual:     { label: "Individual",      color: "bg-destructive text-destructive-foreground" },
  law_firm:       { label: "Law Firm",         color: "bg-orange-600 text-white" },
  university:     { label: "University",       color: "bg-purple-700 text-white" },
  media:          { label: "Media",            color: "bg-blue-700 text-white" },
  federal_agency: { label: "Federal Agency",   color: "bg-foreground text-background" },
  nonprofit:      { label: "Nonprofit / NGO",  color: "bg-amber-600 text-black" },
  foreign_entity: { label: "Foreign Entity",   color: "bg-slate-600 text-white" },
  other:          { label: "Other",            color: "bg-secondary text-secondary-foreground" },
};

const OUTCOME_CONFIG: Record<string, { label: string; bg: string }> = {
  enacted:   { label: "Enacted",         bg: "bg-secondary text-secondary-foreground" },
  blocked:   { label: "Blocked by Court", bg: "bg-destructive text-destructive-foreground" },
  reversed:  { label: "Capitulated / Reversed", bg: "bg-orange-600 text-white" },
  pending:   { label: "Pending",          bg: "bg-yellow-500 text-black" },
  partial:   { label: "Partial",          bg: "bg-amber-500 text-black" },
};

const BAR_COLORS: Record<string, string> = {
  individual: "#cc0000",
  law_firm:   "#ea580c",
  university: "#7c3aed",
  media:      "#1d4ed8",
  nonprofit:  "#d97706",
  other:      "#374151",
};

function RetributionCard({ item }: { item: NonNullable<ReturnType<typeof useListRetributionActions>["data"]>[number] }) {
  const [expanded, setExpanded] = useState(false);
  const ttCfg = TARGET_TYPE_CONFIG[item.targetType] ?? TARGET_TYPE_CONFIG.other;
  const outCfg = OUTCOME_CONFIG[item.outcome] ?? OUTCOME_CONFIG.pending;

  return (
    <Card
      data-testid={`retribution-card-${item.id}`}
      className="border-4 border-border rounded-none shadow-[5px_5px_0px_0px_hsl(var(--border))] hover:shadow-[7px_7px_0px_0px_hsl(var(--destructive))] transition-shadow"
    >
      <CardHeader
        className="border-b-4 border-border pb-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{item.date}</p>
            <CardTitle className="text-base md:text-lg uppercase tracking-wide leading-snug">{item.title}</CardTitle>
            <p className="text-sm font-semibold text-muted-foreground mt-1 truncate">Target: {item.target}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 items-center">
            <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border ${ttCfg.color}`}>
              {ttCfg.label}
            </span>
            <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border ${outCfg.bg}`}>
              {outCfg.label}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-5 space-y-4">
          <p className="text-sm leading-relaxed">{item.description}</p>

          <div className="border-l-4 border-primary pl-4 bg-primary/5 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Why It Matters</p>
            <p className="text-sm font-semibold leading-relaxed">{item.significance}</p>
          </div>

          {item.judicialResponse && (
            <div className="border-l-4 border-destructive pl-4 bg-destructive/5 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Judicial Response</p>
              <p className="text-sm font-semibold leading-relaxed">{item.judicialResponse}</p>
            </div>
          )}

          {Array.isArray(item.references) && item.references.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(item.references as Array<{ title: string; url: string; source: string }>).map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`ret-ref-${item.id}-${idx}`}
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

export default function RetributionPage() {
  const [filterType, setFilterType] = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("");

  const { data: items, isLoading } = useListRetributionActions(
    { targetType: filterType || undefined, outcome: filterOutcome || undefined },
    { query: { queryKey: getListRetributionActionsQueryKey({ targetType: filterType || undefined, outcome: filterOutcome || undefined }) } }
  );
  const { data: stats, isLoading: statsLoading } = useGetRetributionStats();

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-start gap-4 mb-4">
          <Target className="w-12 h-12 text-destructive shrink-0 mt-2" strokeWidth={3} />
          <div>
            <h1 className="text-5xl md:text-7xl tracking-wider uppercase text-foreground drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
              The Revenge Tour
            </h1>
            <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground mt-2">
              Targeted actions against individuals, institutions, and perceived enemies
            </p>
          </div>
        </div>
        <div className="mt-4 border-4 border-destructive p-4 bg-destructive/5">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            Note: These actions have been characterized by legal scholars, opposition politicians, former officials, and major media outlets as politically motivated retaliation.
            All items include primary source citations. This section documents — it does not editorialize.
          </p>
        </div>
      </header>

      {/* Stats */}
      {statsLoading ? (
        <Skeleton className="h-[160px] w-full" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Targeted Actions", value: stats?.total ?? 0, color: "bg-foreground text-background" },
            { label: "Blocked by Courts",       value: stats?.blocked ?? 0, color: "bg-destructive text-destructive-foreground" },
            { label: "Judicially Reversed",     value: stats?.judiciallyReversed ?? 0, color: "bg-orange-600 text-white" },
            { label: "Targets: Law Firms",       value: stats?.byTargetType?.find(t => t.targetType === "law_firm")?.count ?? 0, color: "bg-secondary text-secondary-foreground" },
          ].map((s) => (
            <Card
              key={s.label}
              data-testid={`ret-stat-${s.label.replace(/\s+/g, "-").toLowerCase()}`}
              className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]"
            >
              <CardHeader className={`border-b-4 border-border py-3 px-4 ${s.color}`}>
                <CardTitle className="text-xs uppercase tracking-widest font-bold">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-5xl tracking-wider">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))]">
            <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
              <CardTitle className="text-xl uppercase tracking-wider">Actions by Target Type</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...stats.byTargetType].sort((a, b) => b.count - a.count).map((t) => ({
                    name: TARGET_TYPE_CONFIG[t.targetType]?.label ?? t.targetType,
                    Count: t.count,
                    key: t.targetType,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--foreground))" }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                  />
                  <Bar dataKey="Count" stroke="hsl(var(--border))" strokeWidth={2}>
                    {[...stats.byTargetType].sort((a, b) => b.count - a.count).map((t) => (
                      <Cell key={t.targetType} fill={BAR_COLORS[t.targetType] ?? "#374151"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
            <CardHeader className="border-b-4 border-border bg-secondary text-secondary-foreground">
              <CardTitle className="text-xl uppercase tracking-wider">Actions by Outcome</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...stats.byOutcome].sort((a, b) => b.count - a.count).map((o) => ({
                    name: OUTCOME_CONFIG[o.outcome]?.label ?? o.outcome,
                    Count: o.count,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--foreground))" }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                  />
                  <Bar dataKey="Count" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Target type quick filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TARGET_TYPE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            data-testid={`filter-chip-${key}`}
            onClick={() => setFilterType(filterType === key ? "" : key)}
            className={`px-3 py-1 text-xs font-bold uppercase border-2 border-border transition-all ${
              filterType === key ? cfg.color + " scale-105" : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            {cfg.label}
          </button>
        ))}
        <button
          data-testid="filter-chip-clear"
          onClick={() => { setFilterType(""); setFilterOutcome(""); }}
          className="px-3 py-1 text-xs font-bold uppercase border-2 border-border bg-background text-muted-foreground hover:bg-muted transition-all"
        >
          Clear Filters
        </button>
      </div>

      {/* Outcome filter */}
      <div className="border-b-4 border-border pb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          {items ? `${items.length} Action${items.length !== 1 ? "s" : ""}` : "Loading..."}
          {filterType && ` — ${TARGET_TYPE_CONFIG[filterType]?.label}`}
        </h2>
        <select
          data-testid="ret-filter-outcome"
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
          className="ml-auto border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="">All Outcomes</option>
          {Object.entries(OUTCOME_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => <RetributionCard key={item.id} item={item} />)}
          {items?.length === 0 && (
            <div className="border-4 border-border p-12 text-center">
              <p className="font-bold text-xl uppercase text-muted-foreground">No actions match the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
