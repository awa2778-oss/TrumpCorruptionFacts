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
import {
  ExternalLink,
  Target,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Swords,
  Scale,
  Search,
  MessageSquareX,
  Building2,
  ArrowRight,
} from "lucide-react";

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
  enacted:  { label: "Enacted",              bg: "bg-secondary text-secondary-foreground" },
  blocked:  { label: "Blocked by Court",      bg: "bg-destructive text-destructive-foreground" },
  reversed: { label: "Capitulated / Reversed",bg: "bg-orange-600 text-white" },
  pending:  { label: "Pending",               bg: "bg-yellow-500 text-black" },
  partial:  { label: "Partial",               bg: "bg-amber-500 text-black" },
};

const CONNECTION_CONFIG: Record<string, {
  label: string; bg: string; border: string; icon: React.FC<{ className?: string }>; hex: string; description: string;
}> = {
  appointed: {
    label: "Trump Appointed", bg: "bg-blue-700 text-white", border: "border-blue-900",
    icon: ({ className }) => <UserCheck className={className} />,
    hex: "#1d4ed8",
    description: "Trump personally appointed this person to a government position — they later turned against him or publicly contradicted his claims",
  },
  political_opponent: {
    label: "Political Opponent", bg: "bg-destructive text-destructive-foreground", border: "border-red-900",
    icon: ({ className }) => <Swords className={className} />,
    hex: "#cc0000",
    description: "Direct political adversary who ran against Trump, or was central to a political battle that defined Trump's career",
  },
  legal_adversary: {
    label: "Legal Adversary", bg: "bg-orange-600 text-white", border: "border-orange-900",
    icon: ({ className }) => <Scale className={className} />,
    hex: "#ea580c",
    description: "Directly involved in building the legal cases that resulted in Trump's indictments or criminal prosecution",
  },
  investigator: {
    label: "Investigated Trump", bg: "bg-purple-700 text-white", border: "border-purple-900",
    icon: ({ className }) => <Search className={className} />,
    hex: "#7c3aed",
    description: "Senior official who opened, led, or participated in the investigations into Trump's 2016 campaign and associates",
  },
  critic: {
    label: "Public Critic", bg: "bg-amber-600 text-black", border: "border-amber-900",
    icon: ({ className }) => <MessageSquareX className={className} />,
    hex: "#d97706",
    description: "Former ally or colleague who publicly broke with Trump and became a vocal critic, often contradicting his claims",
  },
  institutional: {
    label: "Institutional Target", bg: "bg-foreground text-background", border: "border-border",
    icon: ({ className }) => <Building2 className={className} />,
    hex: "#374151",
    description: "No direct personal relationship — targeted as an institution representing ideological opposition or political symbolism",
  },
};

const BAR_COLORS: Record<string, string> = {
  individual: "#cc0000",
  law_firm:   "#ea580c",
  university: "#7c3aed",
  media:      "#1d4ed8",
  nonprofit:  "#d97706",
  other:      "#374151",
};

type Item = NonNullable<ReturnType<typeof useListRetributionActions>["data"]>[number];

function ConnectionBadge({ type }: { type: string }) {
  const cfg = CONNECTION_CONFIG[type] ?? CONNECTION_CONFIG.institutional;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-black uppercase border-2 ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RetributionCard({ item }: { item: Item }) {
  const [expanded, setExpanded] = useState(false);
  const ttCfg  = TARGET_TYPE_CONFIG[item.targetType] ?? TARGET_TYPE_CONFIG.other;
  const outCfg = OUTCOME_CONFIG[item.outcome] ?? OUTCOME_CONFIG.pending;
  const connType = (item as any).connectionType as string | null;
  const connText = (item as any).trumpConnection as string | null;
  const connCfg  = CONNECTION_CONFIG[connType ?? "institutional"] ?? CONNECTION_CONFIG.institutional;
  const ConnIcon = connCfg.icon;

  const refs = Array.isArray(item.references)
    ? (item.references as Array<{ title: string; url: string; source: string }>)
    : [];

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
            {connType && <ConnectionBadge type={connType} />}
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

          {/* Prior connection to Trump — the centrepiece */}
          {connText && (
            <div
              className="border-4 p-4 space-y-2"
              style={{ borderColor: connCfg.hex, background: `${connCfg.hex}12` }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-black uppercase border-2 ${connCfg.bg} ${connCfg.border}`}
                >
                  <ConnIcon className="w-3 h-3" />
                  Prior Connection to Trump
                </span>
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {connCfg.label}
                </span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">{connText}</p>
              <div className="flex items-center gap-2 pt-1 text-xs font-bold uppercase text-muted-foreground border-t border-border/40 pt-2">
                <ArrowRight className="w-3 h-3 shrink-0" style={{ color: connCfg.hex }} />
                <span style={{ color: connCfg.hex }}>{connCfg.description}</span>
              </div>
            </div>
          )}

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

          {refs.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {refs.map((ref, idx) => (
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
  const [filterType, setFilterType]       = useState<string>("");
  const [filterOutcome, setFilterOutcome] = useState<string>("");
  const [filterConn, setFilterConn]       = useState<string>("");

  const { data: items, isLoading } = useListRetributionActions(
    { targetType: filterType || undefined, outcome: filterOutcome || undefined },
    { query: { queryKey: getListRetributionActionsQueryKey({ targetType: filterType || undefined, outcome: filterOutcome || undefined }) } }
  );
  const { data: stats, isLoading: statsLoading } = useGetRetributionStats();

  const displayed = filterConn
    ? items?.filter((i) => (i as any).connectionType === filterConn)
    : items;

  // Count by connection type from full dataset
  const connCounts = items
    ? Object.entries(
        items.reduce<Record<string, number>>((acc, i) => {
          const k = ((i as any).connectionType as string) ?? "institutional";
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        }, {})
      )
        .map(([key, count]) => ({ key, count, label: CONNECTION_CONFIG[key]?.label ?? key, fill: CONNECTION_CONFIG[key]?.hex ?? "#374151" }))
        .sort((a, b) => b.count - a.count)
    : [];

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
              Targeted actions — and how each target was once connected to Trump
            </p>
          </div>
        </div>
        <div className="border-4 border-destructive p-4 bg-destructive/5">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            Note: These actions have been characterized by legal scholars, opposition politicians, former officials, and major media outlets as politically motivated retaliation.
            All items include primary source citations. This section documents — it does not editorialize.
          </p>
        </div>
      </header>

      {/* Stats */}
      {statsLoading ? <Skeleton className="h-[160px] w-full" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Targeted Actions", value: stats?.total ?? 0,   color: "bg-foreground text-background" },
            { label: "Blocked by Courts",       value: stats?.blocked ?? 0, color: "bg-destructive text-destructive-foreground" },
            { label: "Trump Appointees Targeted", value: items?.filter((i) => (i as any).connectionType === "appointed").length ?? 0, color: "bg-blue-700 text-white" },
            { label: "Legal Adversaries",        value: items?.filter((i) => (i as any).connectionType === "legal_adversary").length ?? 0, color: "bg-orange-600 text-white" },
          ].map((s) => (
            <Card key={s.label} data-testid={`ret-stat-${s.label.replace(/\s+/g, "-").toLowerCase()}`}
              className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]">
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

      {/* Connection breakdown section */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          Prior Connection to Trump — by Type
        </h2>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          How each target was once connected to Trump before becoming a retaliation subject.
          Click any row to filter the list below.
        </p>

        {!statsLoading && items && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Connection type bar chart */}
            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))] lg:col-span-2">
              <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
                <CardTitle className="text-xl uppercase tracking-wider">Actions by Connection Type</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={connCounts}
                    margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                    onClick={(d) => {
                      if (d?.activePayload?.[0]?.payload?.key) {
                        const k = d.activePayload[0].payload.key as string;
                        setFilterConn(filterConn === k ? "" : k);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={160}
                      tick={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: 11, fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                      formatter={(v) => [v, "Actions"]}
                    />
                    <Bar
                      dataKey="count"
                      stroke="hsl(var(--border))"
                      strokeWidth={2}
                      label={{ position: "right", fontWeight: 900, fontSize: 14, fontFamily: "var(--font-sans)", fill: "hsl(var(--foreground))" }}
                    >
                      {connCounts.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={filterConn === entry.key ? entry.fill : `${entry.fill}99`}
                          stroke={entry.fill}
                          strokeWidth={filterConn === entry.key ? 3 : 2}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Connection legend cards */}
            {Object.entries(CONNECTION_CONFIG).map(([key, cfg]) => {
              const count = items.filter((i) => (i as any).connectionType === key).length;
              if (count === 0) return null;
              const Icon = cfg.icon;
              return (
                <Card
                  key={key}
                  data-testid={`conn-card-${key}`}
                  onClick={() => setFilterConn(filterConn === key ? "" : key)}
                  className={`border-4 rounded-none cursor-pointer transition-all hover:scale-[1.02] ${filterConn === key ? "ring-4 ring-offset-1" : ""}`}
                  style={{ borderColor: cfg.hex, outlineColor: cfg.hex }}
                >
                  <CardHeader className={`border-b-4 py-3 px-4 ${cfg.bg}`} style={{ borderColor: cfg.hex }}>
                    <CardTitle className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                      <span className="ml-auto text-base font-black">{count}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold leading-relaxed text-muted-foreground">{cfg.description}</p>
                    <p className="text-xs font-black uppercase mt-2" style={{ color: cfg.hex }}>
                      {filterConn === key ? "▶ Filtering — click to clear" : "Click to filter list"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

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
          onClick={() => { setFilterType(""); setFilterOutcome(""); setFilterConn(""); }}
          className="px-3 py-1 text-xs font-bold uppercase border-2 border-border bg-background text-muted-foreground hover:bg-muted transition-all"
        >
          Clear All Filters
        </button>
      </div>

      {/* List header */}
      <div className="border-b-4 border-border pb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          {displayed ? `${displayed.length} Action${displayed.length !== 1 ? "s" : ""}` : "Loading..."}
          {filterType  && ` — ${TARGET_TYPE_CONFIG[filterType]?.label}`}
          {filterConn  && ` — ${CONNECTION_CONFIG[filterConn]?.label}`}
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
          {displayed?.map((item) => <RetributionCard key={item.id} item={item} />)}
          {displayed?.length === 0 && (
            <div className="border-4 border-border p-12 text-center">
              <p className="font-bold text-xl uppercase text-muted-foreground">No actions match the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
