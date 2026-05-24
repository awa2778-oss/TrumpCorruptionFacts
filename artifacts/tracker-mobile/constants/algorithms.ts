// Algorithm weights — mirror of artifacts/admin-tracker/src/lib/agency-map.ts
export const CATEGORY_WEIGHTS: Record<string, number> = {
  immigration:      1.00,
  executive_order:  0.90,
  foreign_policy:   0.88,
  tariff:           0.80,
  deregulation:     0.72,
  policy:           0.60,
  proclamation:     0.40,
};

export const STATUS_MULT: Record<string, number> = {
  enacted:  1.00,
  pending:  0.70,
  blocked:  0.35,
  reversed: 0.10,
  ongoing:  0.65,
};

export const FACTUALITY_MOD: Record<string, number> = {
  false:      -15,
  misleading: -10,
  mixed:       -5,
  true:         5,
};

export const CONN_WEIGHTS: Record<string, number> = {
  investigator:       1.00,
  legal_adversary:    0.90,
  appointed:          0.85,
  political_opponent: 0.70,
  critic:             0.60,
  institutional:      0.50,
};

/**
 * Administration Action Severity Index
 * AASI = (cat_w × 30) + (status × 30) + (court × 20) + (factuality × 10) + (recency × 10)
 */
export function calcAASI(a: {
  category: string;
  status: string;
  supremeCourtChallenged?: boolean | null;
  factualityRating?: string | null;
  date: string;
}): number {
  const cat   = (CATEGORY_WEIGHTS[a.category] ?? 0.5) * 30;
  const stat  = (STATUS_MULT[a.status] ?? 0.5) * 30;
  const court = a.supremeCourtChallenged ? 20 : 0;
  const fkey  = (a.factualityRating ?? "").toLowerCase();
  const fact  = (((FACTUALITY_MOD[fkey] ?? 0) + 15) / 30) * 10;
  const days  = Math.max(0, (Date.now() - new Date(a.date).getTime()) / 86400000);
  const rec   = days < 30 ? 10 : days < 90 ? 6 : days < 180 ? 3 : 1;
  return Math.round(Math.min(100, cat + stat + court + fact + rec));
}

/**
 * Retribution Intensity Score
 * RIS = (years × 30) + (conn × 35) + (outcome × 25) + (judicial × 10)
 */
export function calcRIS(r: {
  connectionType?: string | null;
  relationshipYears?: number | null;
  outcome: string;
  judicialResponse?: string | null;
}): number {
  const years = Math.min((r.relationshipYears ?? 0) / 40, 1.0) * 30;
  const conn  = (CONN_WEIGHTS[r.connectionType ?? ""] ?? 0.5) * 35;
  const out   = (STATUS_MULT[r.outcome] ?? 0.5) * 25;
  const jud   = r.judicialResponse ? 10 : 0;
  return Math.round(Math.min(100, years + conn + out + jud));
}

// Helpers for display
export const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  enacted:  { bg: "#059669", label: "ENACTED" },
  blocked:  { bg: "#1D4ED8", label: "BLOCKED" },
  pending:  { bg: "#D97706", label: "PENDING" },
  reversed: { bg: "#6B7280", label: "REVERSED" },
  ongoing:  { bg: "#D97706", label: "ONGOING" },
  partial:  { bg: "#7C3AED", label: "PARTIAL" },
  enacted_partial: { bg: "#7C3AED", label: "PARTIAL" },
};

export const CATEGORY_LABELS: Record<string, string> = {
  executive_order: "E.O.",
  immigration:     "IMMIG",
  tariff:          "TARIFF",
  deregulation:    "DEREG",
  foreign_policy:  "F.P.",
  policy:          "POLICY",
  proclamation:    "PROC",
};

export const CATEGORY_COLORS: Record<string, string> = {
  executive_order: "#CC0000",
  immigration:     "#7C3AED",
  tariff:          "#EA580C",
  deregulation:    "#059669",
  foreign_policy:  "#1D4ED8",
  policy:          "#D97706",
  proclamation:    "#6B7280",
};

export const OUTCOME_COLORS: Record<string, string> = {
  enacted:   "#059669",
  blocked:   "#1D4ED8",
  reversed:  "#6B7280",
  pending:   "#D97706",
  partial:   "#7C3AED",
  ongoing:   "#D97706",
};
