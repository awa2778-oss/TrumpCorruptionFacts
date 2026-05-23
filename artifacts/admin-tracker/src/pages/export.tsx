import { useState } from "react";
import {
  useListActions,
  useListRetributionActions,
  getListRetributionActionsQueryKey,
  useListSupremeCourtCases,
  useListOverreachIncidents,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileSpreadsheet, Table, CheckCircle, Layers } from "lucide-react";
import { exportAllData } from "@/lib/export-excel";

const SHEETS = [
  {
    name: "Administration Actions",
    color: "#CC0000",
    icon: "📋",
    columns: ["ID", "Date", "Title", "Category", "Status", "AASI Score", "Agencies Affected", "Populations Affected", "Factuality Rating", "SCOTUS Challenged", "Description", "Significance"],
    desc: "All 40+ tracked administration actions with agency/population impact mapping and computed Severity Index scores.",
  },
  {
    name: "Retribution Actions",
    color: "#7C3AED",
    icon: "🎯",
    columns: ["ID", "Date", "Title", "Target", "Target Type", "Outcome", "Connection Type", "Years Known to Trump", "RIS Score", "Prior Connection", "Description", "Judicial Response", "Significance"],
    desc: "All 26 Revenge Tour entries — each scored with the Retribution Intensity Score (RIS) algorithm.",
  },
  {
    name: "SCOTUS Cases",
    color: "#1D4ED8",
    icon: "⚖️",
    columns: ["ID", "Case Name", "Date Filed", "Category", "Status", "Admin Position", "Court Outcome", "Significance", "Description"],
    desc: "All tracked Supreme Court cases involving the Trump 2025 administration.",
  },
  {
    name: "Overreach Incidents",
    color: "#EA580C",
    icon: "⚠️",
    columns: ["ID", "Date", "Title", "Category", "Severity", "Status", "Branch Overreached", "Description", "Legal Basis", "Significance"],
    desc: "Executive overreach incidents with legal basis and affected branch.",
  },
  {
    name: "Agency Impact Summary",
    color: "#059669",
    icon: "🏛️",
    columns: ["Agency / Department", "Times Affected by Actions"],
    desc: "Ranked tally of which federal agencies appear most frequently in tracked actions.",
  },
  {
    name: "Population Impact",
    color: "#D97706",
    icon: "👥",
    columns: ["Population Group", "Times Affected by Actions"],
    desc: "Which population groups are most frequently affected across all tracked actions.",
  },
  {
    name: "Severity Rankings",
    color: "#374151",
    icon: "📊",
    columns: ["Tracker", "Date", "Title", "Score Type", "Score (0–100)", "Category / Connection", "Status / Outcome"],
    desc: "Combined ranking of all actions by computed severity score (AASI + RIS), highest to lowest.",
  },
  {
    name: "Legend & Formulas",
    color: "#111827",
    icon: "📖",
    columns: ["Field", "Description"],
    desc: "Algorithm definitions, scoring formulas, and field glossary.",
  },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const { data: adminActions, isLoading: l1 }  = useListActions({});
  const { data: retActions,   isLoading: l2 }  = useListRetributionActions(
    {},
    { query: { queryKey: getListRetributionActionsQueryKey({}) } }
  );
  const { data: scotusCases,  isLoading: l3 }  = useListSupremeCourtCases({});
  const { data: overreach,    isLoading: l4 }  = useListOverreachIncidents({});

  const isLoading = l1 || l2 || l3 || l4;

  const totalRows = (adminActions?.length ?? 0)
    + (retActions?.length ?? 0)
    + (scotusCases?.length ?? 0)
    + (overreach?.length ?? 0);

  async function handleDownload() {
    if (!adminActions || !retActions) return;
    setDownloading(true);
    setDone(false);
    try {
      await new Promise((r) => setTimeout(r, 50)); // allow render update
      exportAllData(
        adminActions as any[],
        retActions   as any[],
        (scotusCases ?? []) as any[],
        (overreach   ?? []) as any[],
      );
      setDone(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="p-8 space-y-10 max-w-6xl mx-auto">

      {/* Header */}
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-start gap-4 mb-4">
          <FileSpreadsheet className="w-12 h-12 text-emerald-600 shrink-0 mt-2" strokeWidth={3} />
          <div>
            <h1 className="text-5xl md:text-6xl tracking-wider uppercase text-foreground drop-shadow-[4px_4px_0px_rgba(5,150,105,1)]">
              Export to Excel
            </h1>
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Full dataset — 8 sheets — agencies, populations, and algorithmic scores
            </p>
          </div>
        </div>
      </header>

      {/* Download card */}
      <Card className="border-4 border-emerald-600 rounded-none shadow-[8px_8px_0px_0px_rgba(5,150,105,1)]">
        <CardHeader className="border-b-4 bg-emerald-700 text-white" style={{ borderColor: "#065f46" }}>
          <CardTitle className="text-2xl uppercase tracking-wider flex items-center gap-3">
            <Download className="w-6 h-6" />
            Download Workbook (.xlsx)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <p className="text-sm font-bold uppercase text-muted-foreground">Loading data…</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Admin Actions",      value: adminActions?.length ?? 0, color: "#CC0000" },
                  { label: "Retribution Actions", value: retActions?.length   ?? 0, color: "#7C3AED" },
                  { label: "SCOTUS Cases",        value: scotusCases?.length  ?? 0, color: "#1D4ED8" },
                  { label: "Overreach Incidents", value: overreach?.length    ?? 0, color: "#EA580C" },
                ].map((s) => (
                  <div key={s.label} className="border-4 border-border p-3 text-center">
                    <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs font-bold uppercase text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading || totalRows === 0}
                  className="inline-flex items-center gap-3 px-8 py-4 border-4 border-emerald-700 bg-emerald-700 text-white font-black uppercase tracking-widest text-lg hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]"
                >
                  {downloading
                    ? <><span className="animate-spin">⟳</span> Building…</>
                    : <><Download className="w-5 h-5" /> Download Excel</>}
                </button>
                {done && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black uppercase">
                    <CheckCircle className="w-5 h-5" />
                    Downloaded — check your downloads folder
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {totalRows} data rows across 8 sheets · includes AASI &amp; RIS algorithm scores · agency and population impact mapping
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet preview grid */}
      <section className="space-y-4">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
          Workbook Contents — 8 Sheets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SHEETS.map((sheet, idx) => (
            <Card key={sheet.name} className="border-4 border-border rounded-none">
              <CardHeader
                className="border-b-4 py-3 px-4 text-white"
                style={{ background: sheet.color, borderColor: sheet.color }}
              >
                <CardTitle className="text-sm uppercase tracking-wide flex items-center gap-2">
                  <span className="text-base">{sheet.icon}</span>
                  Sheet {idx + 1}: {sheet.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{sheet.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {sheet.columns.map((col) => (
                    <span key={col}
                      className="px-1.5 py-0.5 text-xs font-bold uppercase border border-border bg-muted/30">
                      {col}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
