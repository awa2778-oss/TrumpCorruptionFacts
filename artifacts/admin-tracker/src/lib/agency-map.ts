// ─── Agency / Population impact mapping ──────────────────────────────────────
// Used by both the Excel export and the Analytics page

export interface ImpactMap {
  agencies: string[];
  populations: string[];
}

// Category-level defaults
const CATEGORY_DEFAULTS: Record<string, ImpactMap> = {
  executive_order: {
    agencies: ["Executive Office of the President", "OMB", "DOJ"],
    populations: ["Federal workers", "General public"],
  },
  immigration: {
    agencies: ["DHS", "ICE", "CBP", "USCIS", "State Dept", "DOJ"],
    populations: ["Immigrants", "Asylum seekers", "DACA recipients", "Refugees", "Undocumented immigrants", "US citizens with immigrant family"],
  },
  tariff: {
    agencies: ["USTR", "Dept of Commerce", "Treasury", "U.S. Customs & Border Protection"],
    populations: ["Manufacturers", "Importers / Exporters", "Consumers", "Farmers & ranchers", "Retail workers"],
  },
  deregulation: {
    agencies: ["EPA", "OSHA", "FDA", "CFPB", "FTC", "SEC", "CFTC"],
    populations: ["Workers", "Consumers", "Environment", "Public health", "Financial consumers"],
  },
  foreign_policy: {
    agencies: ["State Dept", "NSC", "USAID", "DoD", "CIA"],
    populations: ["Foreign nationals", "NATO allies", "Aid recipients", "U.S. diplomats", "U.S. military"],
  },
  policy: {
    agencies: ["HHS", "Dept of Education", "DOJ", "OMB", "Treasury"],
    populations: ["Students", "Healthcare recipients", "Low-income households", "General public"],
  },
  proclamation: {
    agencies: ["White House", "State Dept"],
    populations: ["General public", "Commemorated groups"],
  },
};

// Keyword overrides for executive orders
const EO_KEYWORD_MAP: Array<{ keywords: string[]; agencies: string[]; populations: string[] }> = [
  {
    keywords: ["education", "school", "student", "university", "dei", "diversity"],
    agencies: ["Dept of Education", "OMB"],
    populations: ["K-12 students", "College students", "Teachers & educators", "Universities"],
  },
  {
    keywords: ["energy", "climate", "paris", "environment", "clean"],
    agencies: ["DOE", "EPA", "Dept of Interior", "NOAA"],
    populations: ["Energy workers", "Environmental communities", "Future generations"],
  },
  {
    keywords: ["border", "immigration", "alien", "migrant", "asylum"],
    agencies: ["DHS", "ICE", "CBP", "USCIS", "DOJ"],
    populations: ["Immigrants", "Asylum seekers", "Border communities", "DACA recipients"],
  },
  {
    keywords: ["doge", "efficiency", "federal workforce", "bureaucracy", "federal employee", "agency"],
    agencies: ["OPM", "OMB", "All federal agencies", "DOGE"],
    populations: ["Federal employees", "Government contractors", "Public service recipients"],
  },
  {
    keywords: ["tariff", "trade", "import", "liberation"],
    agencies: ["USTR", "Dept of Commerce", "Treasury", "CBP"],
    populations: ["Manufacturers", "Importers / Exporters", "Consumers"],
  },
  {
    keywords: ["health", "medicare", "medicaid", "abortion", "vaccine"],
    agencies: ["HHS", "CMS", "FDA", "CDC"],
    populations: ["Patients", "Healthcare workers", "Low-income households", "Women"],
  },
  {
    keywords: ["military", "defense", "transgender", "armed forces"],
    agencies: ["DoD", "Pentagon", "Joint Chiefs"],
    populations: ["Military personnel", "Veterans", "Transgender individuals"],
  },
  {
    keywords: ["law firm", "perkins", "paul weiss", "covington", "attorney", "legal"],
    agencies: ["DOJ", "White House Counsel"],
    populations: ["Legal profession", "Law firm clients", "Rule of law"],
  },
  {
    keywords: ["history", "smithsonian", "museum", "monument", "statue"],
    agencies: ["Smithsonian", "Library of Congress", "Interior Dept"],
    populations: ["Historians", "Educators", "Cultural institutions", "General public"],
  },
  {
    keywords: ["gender", "sex", "title ix", "women"],
    agencies: ["Dept of Education", "HHS", "DOJ"],
    populations: ["Women", "LGBTQ+ individuals", "Students"],
  },
  {
    keywords: ["election", "voting", "ballot"],
    agencies: ["DOJ Civil Rights Division", "FEC", "EAC"],
    populations: ["Voters", "Election workers", "Democratic institutions"],
  },
];

/** Returns the best-matching agency + population arrays for an action */
export function getImpactMap(category: string, title: string, description: string = ""): ImpactMap {
  const haystack = (title + " " + description).toLowerCase();

  if (category === "executive_order") {
    for (const rule of EO_KEYWORD_MAP) {
      if (rule.keywords.some((k) => haystack.includes(k))) {
        return { agencies: rule.agencies, populations: rule.populations };
      }
    }
  }

  return CATEGORY_DEFAULTS[category] ?? {
    agencies: ["Multiple federal agencies"],
    populations: ["General public"],
  };
}

// ─── Algorithm weights ─────────────────────────────────────────────────────

export const CATEGORY_WEIGHTS: Record<string, number> = {
  immigration:    1.00,
  executive_order: 0.90,
  foreign_policy: 0.88,
  tariff:         0.80,
  deregulation:   0.72,
  policy:         0.60,
  proclamation:   0.40,
};

export const STATUS_MULTIPLIERS: Record<string, number> = {
  enacted:  1.00,
  pending:  0.70,
  blocked:  0.35,
  reversed: 0.10,
};

export const OUTCOME_SEVERITY: Record<string, number> = {
  enacted:  1.00,
  pending:  0.70,
  blocked:  0.35,
  reversed: 0.10,
  ongoing:  0.65,
};

export const CONNECTION_TYPE_WEIGHTS: Record<string, number> = {
  investigator:      1.00,
  legal_adversary:   0.90,
  appointed:         0.85,   // high – betrayal factor
  political_opponent: 0.70,
  critic:            0.60,
  institutional:     0.50,
};

export const FACTUALITY_MODIFIERS: Record<string, number> = {
  false:      -15,
  misleading: -10,
  mixed:       -5,
  true:         5,
  "":           0,
};

/**
 * Administration Action Severity Index (AASI)
 * Score 0–100 representing the real-world impact severity of an admin action.
 *
 * Formula:
 *   AASI = (cat_w × 30) + (status_m × 30) + (court_bonus × 20) + (factuality_adj × 10) + (recency × 10)
 *
 * Max possible = 100
 */
export function calcAASI(action: {
  category: string;
  status: string;
  supreme_court_challenged?: boolean | null;
  factuality_rating?: string | null;
  date: string;
}): number {
  const catScore  = (CATEGORY_WEIGHTS[action.category] ?? 0.5) * 30;
  const statScore = (STATUS_MULTIPLIERS[action.status] ?? 0.5) * 30;
  const courtBonus = action.supreme_court_challenged ? 20 : 0;

  const factKey = (action.factuality_rating ?? "").toLowerCase();
  const factAdj = ((FACTUALITY_MODIFIERS[factKey] ?? 0) + 15) / 30 * 10; // normalize to 0-10

  const daysSince = Math.max(0, (Date.now() - new Date(action.date).getTime()) / 86400000);
  const recency = daysSince < 30 ? 10 : daysSince < 90 ? 6 : daysSince < 180 ? 3 : 1;

  return Math.round(Math.min(100, catScore + statScore + courtBonus + factAdj + recency));
}

/**
 * Retribution Intensity Score (RIS)
 * Score 0–100 representing the severity of a retribution action.
 *
 * Formula:
 *   RIS = (years_factor × 30) + (conn_weight × 35) + (outcome_sev × 25) + (judicial_factor × 10)
 */
export function calcRIS(action: {
  connection_type?: string | null;
  relationship_years?: number | null;
  outcome: string;
  judicial_response?: string | null;
}): number {
  const years       = action.relationship_years ?? 0;
  const yearsFactor = Math.min(years / 40, 1.0) * 30;
  const connWeight  = (CONNECTION_TYPE_WEIGHTS[action.connection_type ?? ""] ?? 0.5) * 35;
  const outcomeSev  = (OUTCOME_SEVERITY[action.outcome] ?? 0.5) * 25;
  const judicialF   = action.judicial_response ? 10 : 0;

  return Math.round(Math.min(100, yearsFactor + connWeight + outcomeSev + judicialF));
}

/**
 * Court Resistance Ratio (CRR)
 * Proportion of actions in a category that were blocked or reversed.
 */
export function calcCRR(actions: Array<{ status?: string; outcome?: string }>): number {
  if (!actions.length) return 0;
  const resisted = actions.filter(
    (a) => (a.status ?? a.outcome) === "blocked" || (a.status ?? a.outcome) === "reversed"
  ).length;
  return Math.round((resisted / actions.length) * 100);
}

/**
 * Presidential Accountability Gap (PAG)
 * Retribution actions per court block/reversal.
 * Higher = more retribution relative to accountability checks.
 */
export function calcPAG(retributionCount: number, courtResisted: number): number {
  return Math.round((retributionCount / (courtResisted + 1)) * 10) / 10;
}
