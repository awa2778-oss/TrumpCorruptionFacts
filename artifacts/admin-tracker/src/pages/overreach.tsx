import { useState } from "react";
import {
  useListOverreachIncidents,
  getListOverreachIncidentsQueryKey,
  useGetOverreachStats,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { ExternalLink, AlertTriangle } from "lucide-react";

const OUTCOME_COLORS: Record<string, string> = {
  blocked: "bg-destructive text-destructive-foreground",
  overturned: "bg-orange-600 text-white",
  upheld: "bg-green-700 text-white",
  pending: "bg-yellow-500 text-black",
  partially_upheld: "bg-amber-600 text-white",
};

const TYPE_LABELS: Record<string, string> = {
  court_injunction: "Court Injunction",
  constitutional_challenge: "Constitutional Challenge",
  statutory_overreach: "Statutory Overreach",
  contempt: "Contempt of Court",
  congressional_rebuke: "Congressional Rebuke",
  other: "Other",
};

const OUTCOME_LABELS: Record<string, string> = {
  blocked: "Blocked",
  overturned: "Overturned",
  upheld: "Upheld",
  pending: "Pending",
  partially_upheld: "Partial",
};

const ADMIN_LABELS: Record<string, string> = {
  trump_2025: "Trump 2025",
  trump_2017: "Trump 2017",
  biden: "Biden",
  obama: "Obama",
  bush_jr: "Bush Jr.",
  clinton: "Clinton",
  reagan: "Reagan",
};

export default function OverreachPage() {
  const [filterAdmin, setFilterAdmin] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  const { data: incidents, isLoading: incidentsLoading } = useListOverreachIncidents(
    { administration: filterAdmin || undefined, type: filterType || undefined },
    { query: { queryKey: getListOverreachIncidentsQueryKey({ administration: filterAdmin || undefined, type: filterType || undefined }) } }
  );
  const { data: stats, isLoading: statsLoading } = useGetOverreachStats();

  const administrations = Array.from(
    new Set((incidents ?? []).map((i) => i.administration))
  ).sort();

  const types = Object.keys(TYPE_LABELS);

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <header className="mb-8 border-b-8 border-border pb-6">
        <div className="flex items-center gap-4 mb-4">
          <AlertTriangle className="w-12 h-12 text-destructive" strokeWidth={3} />
          <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
            Executive Overreach
          </h1>
        </div>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Actions challenged, blocked, or struck down — compared across administrations
        </p>
      </header>

      {statsLoading ? (
        <Skeleton className="h-[480px] w-full" />
      ) : (
        <section className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats
              ?.filter((s) => s.administration === "trump_2025")
              .map((s) => [
                { label: "Total Incidents", value: s.totalIncidents, color: "bg-foreground text-background" },
                { label: "Blocked / Overturned", value: s.blocked + s.overturned, color: "bg-destructive text-destructive-foreground" },
                { label: "Court Injunctions", value: s.courtInjunctions, color: "bg-secondary text-secondary-foreground" },
                { label: "Const. Challenges", value: s.constitutionalChallenges, color: "bg-primary text-primary-foreground" },
              ])
              .flat()
              .map((stat) => (
                <Card
                  key={stat.label}
                  data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))]"
                >
                  <CardHeader className={`border-b-4 border-border py-3 px-4 ${stat.color}`}>
                    <CardTitle className="text-sm uppercase tracking-widest font-bold">{stat.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-5xl tracking-wider">{stat.value}</p>
                    <p className="text-xs font-bold uppercase text-muted-foreground mt-1">Trump 2025</p>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))]">
              <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
                <CardTitle className="text-2xl uppercase tracking-wider">Blocked / Overturned Actions by Administration</CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.map((s) => ({
                      president: ADMIN_LABELS[s.administration] ?? s.president,
                      Blocked: s.blocked,
                      Overturned: s.overturned,
                      Pending: s.pending,
                    }))}
                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="president"
                      tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fontSize: 12, fill: "hsl(var(--foreground))" }}
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
                    <Bar dataKey="Blocked" fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="Overturned" fill="#ea580c" stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="Pending" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
              <CardHeader className="border-b-4 border-border bg-secondary text-secondary-foreground">
                <CardTitle className="text-2xl uppercase tracking-wider">Overreach Type Breakdown — Trump 2025</CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats
                      ?.filter((s) => s.administration === "trump_2025")
                      .map((s) => ({
                        name: "Trump 2025",
                        "Court Injunctions": s.courtInjunctions,
                        "Const. Challenges": s.constitutionalChallenges,
                        "Statutory Overreach": s.statutoryOverreach,
                        "Congressional Rebukes": s.congressionalRebukes,
                      }))}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontFamily: "var(--font-sans)", fontWeight: "bold", fill: "hsl(var(--foreground))" }} width={120} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase" }}
                    />
                    <Legend wrapperStyle={{ fontWeight: "bold", textTransform: "uppercase" }} />
                    <Bar dataKey="Court Injunctions" fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="Const. Challenges" fill="#7c3aed" stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="Statutory Overreach" fill="#ea580c" stroke="hsl(var(--border))" strokeWidth={2} />
                    <Bar dataKey="Congressional Rebukes" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-4 border-border rounded-none overflow-hidden">
            <CardHeader className="bg-foreground text-background border-b-4 border-border">
              <CardTitle className="text-3xl uppercase tracking-wider">Total Incidents by Administration</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b-4 border-border bg-muted">
                    <th className="text-left py-4 px-4 font-display text-lg uppercase">Administration</th>
                    <th className="text-center py-4 px-3 font-display text-lg uppercase">Total</th>
                    <th className="text-center py-4 px-3 font-display text-lg uppercase text-destructive">Blocked</th>
                    <th className="text-center py-4 px-3 font-display text-lg uppercase text-orange-600">Overturned</th>
                    <th className="text-center py-4 px-3 font-display text-lg uppercase text-yellow-600">Pending</th>
                    <th className="text-center py-4 px-3 font-display text-lg uppercase text-green-700">Upheld</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.map((s) => (
                    <tr
                      key={s.administration}
                      data-testid={`overreach-row-${s.administration}`}
                      className={`border-b-2 border-border hover:bg-accent transition-colors ${s.administration === "trump_2025" ? "bg-primary/10 font-bold" : ""}`}
                    >
                      <td className="py-4 px-4 font-bold text-lg">
                        {s.president}
                        <span className={`ml-2 text-sm px-1 border-2 border-border ${s.party === "Republican" ? "bg-destructive text-destructive-foreground" : "bg-blue-600 text-white"}`}>
                          {s.party === "Republican" ? "R" : "D"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-center font-display text-3xl">{s.totalIncidents}</td>
                      <td className="py-4 px-3 text-center font-display text-2xl text-destructive">{s.blocked}</td>
                      <td className="py-4 px-3 text-center font-display text-2xl text-orange-600">{s.overturned}</td>
                      <td className="py-4 px-3 text-center font-display text-2xl text-yellow-600">{s.pending}</td>
                      <td className="py-4 px-3 text-center font-display text-2xl text-green-700">{s.upheld}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-6">
        <div className="border-b-8 border-border pb-4 flex flex-col md:flex-row md:items-end gap-4">
          <h2 className="text-4xl uppercase tracking-wider text-foreground drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
            Incident Records
          </h2>
          <div className="flex flex-wrap gap-3 ml-auto">
            <select
              data-testid="filter-admin"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">All Administrations</option>
              {Object.entries(ADMIN_LABELS).map(([slug, label]) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
            <select
              data-testid="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border-4 border-border bg-background font-bold uppercase tracking-wider px-3 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>

        {incidentsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {incidents?.map((incident) => (
              <Card
                key={incident.id}
                data-testid={`incident-card-${incident.id}`}
                className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--border))] hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))] transition-shadow"
              >
                <CardHeader className="border-b-4 border-border pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <CardTitle className="text-xl uppercase tracking-wide pr-4">{incident.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border ${OUTCOME_COLORS[incident.outcome] ?? "bg-muted text-foreground"}`}>
                        {OUTCOME_LABELS[incident.outcome] ?? incident.outcome}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-secondary text-secondary-foreground">
                        {TYPE_LABELS[incident.type] ?? incident.type}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-muted text-foreground">
                        {ADMIN_LABELS[incident.administration] ?? incident.administration} · {incident.year}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <p className="text-base leading-relaxed">{incident.description}</p>
                  <div className="border-l-4 border-primary pl-4 bg-primary/5 py-2">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Significance</p>
                    <p className="text-sm font-semibold">{incident.significance}</p>
                  </div>
                  {Array.isArray(incident.references) && incident.references.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(incident.references as Array<{ title: string; url: string; source: string }>).map((ref, idx) => (
                        <a
                          key={idx}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`ref-link-${incident.id}-${idx}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {ref.source}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {incidents?.length === 0 && (
              <div className="border-4 border-border p-12 text-center">
                <p className="font-bold text-xl uppercase text-muted-foreground">No incidents match the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
