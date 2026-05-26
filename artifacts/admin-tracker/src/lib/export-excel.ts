import * as XLSX from "xlsx";
import { getImpactMap, calcAASI, calcRIS } from "./agency-map";

/** Trigger a browser file download */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

/** Style a header row bold + background fill */
function styleHeader(ws: XLSX.WorkSheet, range: string, fillColor: string) {
  const ref = XLSX.utils.decode_range(range);
  for (let C = ref.s.c; C <= ref.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: ref.s.r, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: fillColor } },
      alignment: { wrapText: true, vertical: "center" },
      border: {
        bottom: { style: "medium", color: { rgb: "000000" } },
      },
    };
  }
}

/** Set column widths */
function setCols(ws: XLSX.WorkSheet, widths: number[]) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}

// ─── Main export function ─────────────────────────────────────────────────────

export function exportAllData(
  adminActions: any[],
  retributionActions: any[],
  scotusCases: any[],
  overreachIncidents: any[],
) {
  const wb = XLSX.utils.book_new();
  const today = new Date().toLocaleDateString("en-US");

  // ── Sheet 1: Administration Actions ──────────────────────────────────────
  const adminRows = adminActions.map((a) => {
    const impact = getImpactMap(a.category ?? "", a.title ?? "", a.description ?? "");
    const score = calcAASI({
      category: a.category,
      status: a.status,
      supreme_court_challenged: a.supremeCourtChallenged ?? a.supreme_court_challenged,
      factuality_rating: a.factualityRating ?? a.factuality_rating,
      date: a.date,
    });
    return {
      "ID": a.id,
      "Date": a.date,
      "Title": a.title,
      "Category": (a.category ?? "").replace(/_/g, " ").toUpperCase(),
      "Administration": (a.administration ?? "").replace(/_/g, " ").toUpperCase(),
      "Status": (a.status ?? "").toUpperCase(),
      "AASI Score (0–100)": score,
      "Agencies Affected": impact.agencies.join("; "),
      "Populations Affected": impact.populations.join("; "),
      "Factuality Rating": (a.factualityRating ?? a.factuality_rating ?? "").toUpperCase() || "N/A",
      "SCOTUS Challenged": (a.supremeCourtChallenged ?? a.supreme_court_challenged) ? "YES" : "No",
      "Description": a.description,
      "Significance": a.significance,
      "Source / Notes": a.factualityNotes ?? a.factuality_notes ?? "",
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(adminRows);
  setCols(ws1, [5, 12, 45, 18, 16, 12, 18, 45, 45, 16, 16, 60, 60, 60]);
  styleHeader(ws1, `A1:N1`, "CC0000");
  XLSX.utils.book_append_sheet(wb, ws1, "Administration Actions");

  // ── Sheet 2: Retribution Actions ─────────────────────────────────────────
  const retRows = retributionActions.map((r) => {
    const score = calcRIS({
      connection_type: r.connectionType ?? r.connection_type,
      relationship_years: r.relationshipYears ?? r.relationship_years,
      outcome: r.outcome,
      judicial_response: r.judicialResponse ?? r.judicial_response,
    });
    return {
      "ID": r.id,
      "Date": r.date,
      "Title": r.title,
      "Target": r.target,
      "Target Type": (r.targetType ?? r.target_type ?? "").replace(/_/g, " ").toUpperCase(),
      "Outcome": (r.outcome ?? "").toUpperCase(),
      "Connection Type": (r.connectionType ?? r.connection_type ?? "").replace(/_/g, " ").toUpperCase(),
      "Years Known to Trump": r.relationshipYears ?? r.relationship_years ?? "N/A",
      "RIS Score (0–100)": score,
      "Prior Connection to Trump": r.trumpConnection ?? r.trump_connection ?? "",
      "Description": r.description,
      "Judicial Response": r.judicialResponse ?? r.judicial_response ?? "",
      "Significance": r.significance,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(retRows);
  setCols(ws2, [5, 12, 45, 35, 18, 12, 22, 18, 16, 60, 60, 50, 60]);
  styleHeader(ws2, `A1:M1`, "7C3AED");
  XLSX.utils.book_append_sheet(wb, ws2, "Retribution Actions");

  // ── Sheet 3: SCOTUS Cases ─────────────────────────────────────────────────
  if (scotusCases.length > 0) {
    const scotusRows = scotusCases.map((c) => ({
      "ID": c.id,
      "Case Name": c.caseName ?? c.case_name ?? c.title,
      "Date Filed": c.dateFiled ?? c.date_filed ?? c.date,
      "Category": (c.category ?? "").replace(/_/g, " ").toUpperCase(),
      "Status": (c.status ?? "").toUpperCase(),
      "Administration Position": c.administrationPosition ?? c.administration_position ?? "",
      "Court Outcome": c.courtOutcome ?? c.court_outcome ?? c.outcome ?? "",
      "Significance": c.significance,
      "Description": c.description,
    }));
    const ws3 = XLSX.utils.json_to_sheet(scotusRows);
    setCols(ws3, [5, 45, 14, 20, 14, 35, 20, 60, 60]);
    styleHeader(ws3, `A1:I1`, "1D4ED8");
    XLSX.utils.book_append_sheet(wb, ws3, "SCOTUS Cases");
  }

  // ── Sheet 4: Overreach Incidents ─────────────────────────────────────────
  if (overreachIncidents.length > 0) {
    const overRows = overreachIncidents.map((o) => ({
      "ID": o.id,
      "Date": o.date,
      "Title": o.title,
      "Category": (o.category ?? "").replace(/_/g, " ").toUpperCase(),
      "Severity": (o.severity ?? "").toUpperCase(),
      "Status": (o.status ?? o.outcome ?? "").toUpperCase(),
      "Branch Overreached": o.branch ?? o.branchOverreached ?? "",
      "Description": o.description,
      "Legal Basis": o.legalBasis ?? o.legal_basis ?? "",
      "Significance": o.significance,
    }));
    const ws4 = XLSX.utils.json_to_sheet(overRows);
    setCols(ws4, [5, 12, 45, 20, 14, 14, 20, 60, 40, 60]);
    styleHeader(ws4, `A1:J1`, "EA580C");
    XLSX.utils.book_append_sheet(wb, ws4, "Overreach Incidents");
  }

  // ── Sheet 5: Agency Impact Summary ───────────────────────────────────────
  const agencyTally: Record<string, number> = {};
  adminActions.forEach((a) => {
    const impact = getImpactMap(a.category ?? "", a.title ?? "", a.description ?? "");
    impact.agencies.forEach((ag) => {
      agencyTally[ag] = (agencyTally[ag] ?? 0) + 1;
    });
  });
  const agencyRows = Object.entries(agencyTally)
    .sort((a, b) => b[1] - a[1])
    .map(([agency, count]) => ({ "Agency / Department": agency, "Times Affected by Actions": count }));
  const ws5 = XLSX.utils.json_to_sheet(agencyRows);
  setCols(ws5, [40, 30]);
  styleHeader(ws5, `A1:B1`, "059669");
  XLSX.utils.book_append_sheet(wb, ws5, "Agency Impact Summary");

  // ── Sheet 6: Population Impact Summary ──────────────────────────────────
  const popTally: Record<string, number> = {};
  adminActions.forEach((a) => {
    const impact = getImpactMap(a.category ?? "", a.title ?? "", a.description ?? "");
    impact.populations.forEach((p) => {
      popTally[p] = (popTally[p] ?? 0) + 1;
    });
  });
  const popRows = Object.entries(popTally)
    .sort((a, b) => b[1] - a[1])
    .map(([pop, count]) => ({ "Population Group": pop, "Times Affected by Actions": count }));
  const ws6 = XLSX.utils.json_to_sheet(popRows);
  setCols(ws6, [45, 30]);
  styleHeader(ws6, `A1:B1`, "D97706");
  XLSX.utils.book_append_sheet(wb, ws6, "Population Impact");

  // ── Sheet 7: Combined Severity Rankings ──────────────────────────────────
  const allScored = [
    ...adminActions.map((a) => ({
      "Tracker": "Administration",
      "Date": a.date,
      "Title": a.title,
      "Score Type": "AASI",
      "Score (0–100)": calcAASI({
        category: a.category,
        status: a.status,
        supreme_court_challenged: a.supremeCourtChallenged ?? a.supreme_court_challenged,
        factuality_rating: a.factualityRating ?? a.factuality_rating,
        date: a.date,
      }),
      "Category / Connection": (a.category ?? "").replace(/_/g, " ").toUpperCase(),
      "Status / Outcome": (a.status ?? "").toUpperCase(),
    })),
    ...retributionActions.map((r) => ({
      "Tracker": "Retribution",
      "Date": r.date,
      "Title": r.title + ` — ${r.target}`,
      "Score Type": "RIS",
      "Score (0–100)": calcRIS({
        connection_type: r.connectionType ?? r.connection_type,
        relationship_years: r.relationshipYears ?? r.relationship_years,
        outcome: r.outcome,
        judicial_response: r.judicialResponse ?? r.judicial_response,
      }),
      "Category / Connection": (r.connectionType ?? r.connection_type ?? "").replace(/_/g, " ").toUpperCase(),
      "Status / Outcome": (r.outcome ?? "").toUpperCase(),
    })),
  ].sort((a, b) => b["Score (0–100)"] - a["Score (0–100)"]);

  const ws7 = XLSX.utils.json_to_sheet(allScored);
  setCols(ws7, [18, 12, 55, 12, 16, 28, 16]);
  styleHeader(ws7, `A1:G1`, "374151");
  XLSX.utils.book_append_sheet(wb, ws7, "Severity Rankings");

  // ── Sheet 8: README / Legend ──────────────────────────────────────────────
  const readmeData = [
    { "Field": "Exported on", "Description": today },
    { "Field": "Source", "Description": "TrumpCorruptionFacts — Trump 2025" },
    { "Field": "", "Description": "" },
    { "Field": "AASI", "Description": "Administration Action Severity Index (0–100). Formula: (category_weight × 30) + (status_multiplier × 30) + (court_challenged × 20) + (factuality_adj × 10) + (recency × 10)" },
    { "Field": "RIS", "Description": "Retribution Intensity Score (0–100). Formula: (years_factor × 30) + (connection_weight × 35) + (outcome_severity × 25) + (judicial_response × 10)" },
    { "Field": "", "Description": "" },
    { "Field": "AASI Category Weights", "Description": "immigration=1.0, executive_order=0.9, foreign_policy=0.88, tariff=0.8, deregulation=0.72, policy=0.6, proclamation=0.4" },
    { "Field": "AASI Status Multipliers", "Description": "enacted=1.0, pending=0.7, blocked=0.35, reversed=0.1" },
    { "Field": "RIS Connection Weights", "Description": "investigator=1.0, legal_adversary=0.9, appointed=0.85, political_opponent=0.7, critic=0.6, institutional=0.5" },
    { "Field": "RIS Outcome Severity", "Description": "enacted=1.0, pending=0.7, blocked/ongoing=0.35–0.65, reversed=0.1" },
    { "Field": "", "Description": "" },
    { "Field": "Status: BLOCKED", "Description": "Action was halted by a court order or judicial ruling" },
    { "Field": "Status: ENACTED", "Description": "Action is in effect as of export date" },
    { "Field": "Status: PENDING", "Description": "Action announced but not yet fully implemented or challenged" },
    { "Field": "Status: REVERSED", "Description": "Action was implemented but subsequently reversed or repealed" },
  ];
  const ws8 = XLSX.utils.json_to_sheet(readmeData);
  setCols(ws8, [30, 90]);
  styleHeader(ws8, `A1:B1`, "111827");
  XLSX.utils.book_append_sheet(wb, ws8, "Legend & Formulas");

  // ── Write and download ────────────────────────────────────────────────────
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, `trump-administration-tracker-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
