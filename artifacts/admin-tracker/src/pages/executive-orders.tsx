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
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { ExternalLink, FileText, ChevronDown, ChevronUp } from "lucide-react";

const JUDICIAL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  not_challenged:      { label: "Not Challenged",  color: "text-green-700",    bg: "bg-green-700 text-white border-green-800" },
  challenged_blocked:  { label: "Blocked by Court", color: "text-destructive",  bg: "bg-destructive text-destructive-foreground" },
  challenged_upheld:   { label: "Court Upheld",     color: "text-green-700",    bg: "bg-green-700 text-white" },
  challenged_pending:  { label: "Challenge Pending", color: "text-yellow-600",  bg: "bg-yellow-500 text-black" },
  challenged_partial:  { label: "Partially Upheld", color: "text-amber-600",    bg: "bg-amber-500 text-black" },
};

const STATUS_CONFIG: Record<string, string> = {
  enacted:          "bg-secondary text-secondary-foreground",
  blocked:          "bg-destructive text-destructive-foreground",
  pending:          "bg-yellow-500 text-black",
  enacted_paused:   "bg-amber-500 text-black",
};

const ADMIN_SHORT: Record<string, string> = {
  trump_2025: "Trump '25", trump_2017: "Trump '17", biden: "Biden",
  obama: "Obama", bush_jr: "Bush Jr.", clinton: "Clinton",
  bush_sr: "Bush Sr.", reagan: "Reagan",
};

function EoCard({ eo }: { eo: ReturnType<typeof useListExecutiveOrders>["data"] extends (infer T)[] | undefined ? T : never }) {
  const [expanded, setExpanded] = useState(false);
  if (!eo) return null;
  const jsCfg = JUDICIAL_STATUS_CONFIG[eo.judicialStatus] ?? JUDICIAL_STATUS_CONFIG.not_challenged;

  return (
    <Card
      data-testid={`eo-card-${eo.id}`}
      className="border-4 border-border rounded-none shadow-[5px_5px_0px_0px_hsl(var(--border))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] transition-shadow"
    >
      <CardHeader className="border-b-4 border-border pb-3 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="shrink-0 font-display text-xs uppercase tracking-wider bg-foreground text-background px-2 py-1 border-2 border-border whitespace-nowrap">
              {eo.eoNumber}
            </span>
            <CardTitle className="text-base md:text-lg uppercase tracking-wide leading-snug">{eo.title.replace(/^EO\s?\d+:\s*/i, "")}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 items-center">
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

          {eo.judicialChallenges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Judicial Challenges</p>
              {eo.judicialChallenges.map((ch) => (
                <div
                  key={ch.id}
                  className="border-l-4 border-destructive pl-4 bg-destructive/5 py-2 space-y-1"
                >
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

          {Array.isArray(eo.references) && eo.references.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(eo.references as Array<{ title: string; url: string; source: string }>).map((ref, idx) => (
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

export default function ExecutiveOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: eos, isLoading: eosLoading } = useListExecutiveOrders(
    { administration: "trump_2025", judicialStatus: filterStatus || undefined },
    { query: { queryKey: getListExecutiveOrdersQueryKey({ administration: "trump_2025", judicialStatus: filterStatus || undefined }) } }
  );
  const { data: comparison, isLoading: compLoading } = useCompareExecutiveOrders();

  const filtered = eos?.filter((eo) =>
    searchTerm
      ? eo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eo.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const challengedCount = eos?.filter((e) => e.judicialStatus !== "not_challenged").length ?? 0;
  const blockedCount = eos?.filter((e) => e.judicialStatus === "challenged_blocked").length ?? 0;
  const pendingCount = eos?.filter((e) => e.judicialStatus === "challenged_pending").length ?? 0;
  const notChallengedCount = eos?.filter((e) => e.judicialStatus === "not_challenged").length ?? 0;

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
          All EOs since January 20, 2025 — with judicial outcomes
        </p>
      </header>

      {/* Trump 2025 stat bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total EOs Tracked", value: eos?.length ?? "—", color: "bg-foreground text-background" },
          { label: "Judicially Challenged", value: challengedCount, color: "bg-destructive text-destructive-foreground" },
          { label: "Blocked by Courts", value: blockedCount, color: "bg-orange-600 text-white" },
          { label: "Not Challenged", value: notChallengedCount, color: "bg-secondary text-secondary-foreground" },
        ].map((s) => (
          <Card
            key={s.label}
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]"
          >
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

      {/* Comparison charts */}
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
                  data={comparison?.map((c) => ({
                    name: ADMIN_SHORT[c.administration] ?? c.president,
                    "EOs / Year": c.eosPerYear,
                    party: c.party,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 55 }}
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
                  <Bar
                    dataKey="EOs / Year"
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                  />
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
                  data={comparison?.map((c) => ({
                    name: ADMIN_SHORT[c.administration] ?? c.president,
                    Challenged: c.challengedEOs,
                    Blocked: c.blockedEOs,
                    Pending: c.pendingEOs,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 55 }}
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
                  <Legend wrapperStyle={{ fontWeight: "bold", textTransform: "uppercase" }} />
                  <Bar dataKey="Challenged" fill="hsl(var(--foreground))" stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar dataKey="Blocked" fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={2} />
                  <Bar dataKey="Pending" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--border))] lg:col-span-2">
            <CardHeader className="border-b-4 border-border bg-foreground text-background">
              <CardTitle className="text-xl uppercase tracking-wider">Court Challenge Rate (% of EOs Challenged)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparison?.map((c) => ({
                    name: ADMIN_SHORT[c.administration] ?? c.president,
                    "Challenge Rate %": c.challengeRate,
                    party: c.party,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 11, fill: "hsl(var(--background))" }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--background))" }}
                    unit="%"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.1)" }}
                    contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase", background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [`${v}%`, "Challenge Rate"]}
                  />
                  <Bar dataKey="Challenge Rate %" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EO list */}
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
