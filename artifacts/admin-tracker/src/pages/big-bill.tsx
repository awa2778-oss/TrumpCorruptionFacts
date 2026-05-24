import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, Legend, LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HeartPulse, DollarSign, AlertTriangle, TrendingDown, TrendingUp,
  Landmark, Users, BookOpen, ChevronDown, ChevronUp, ExternalLink,
  Clock, Moon, FileText, AlertOctagon, Timer,
} from "lucide-react";
import { useState } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const CBO_HEADLINE_STATS = [
  { label: "Added to Deficit (10 yr)", value: "$3.3T", color: "bg-destructive text-destructive-foreground", icon: TrendingUp },
  { label: "Lose Medicaid Coverage", value: "10.3M", color: "bg-orange-600 text-white", icon: HeartPulse },
  { label: "Lose Marketplace Insurance", value: "4.2M", color: "bg-amber-500 text-black", icon: Users },
  { label: "Lose SNAP Benefits", value: "3M+", color: "bg-yellow-600 text-white", icon: DollarSign },
  { label: "Medicaid Cuts (10 yr)", value: "$715B", color: "bg-foreground text-background", icon: TrendingDown },
  { label: "SNAP Cuts (10 yr)", value: "$290B", color: "bg-slate-700 text-white", icon: Landmark },
];

const MEDICAID_CUTS = [
  { provision: "Work Requirements (80 hrs/mo)", people_losing: 5100, billions: 180, detail: "Non-disabled adults 19-64 must document 80 hrs/month of work, job training, or community service. States must build verification infrastructure. CBO projects 5.1M will lose coverage — many will be eligible but unable to navigate new paperwork." },
  { provision: "End of Retroactive Eligibility", people_losing: 1800, billions: 31, detail: "Before: Medicaid could cover the 3 months before you applied — critical for hospitalizations. After: Coverage begins at earliest the month you apply. Millions who fall ill before applying will face uncovered bills for prior care." },
  { provision: "Provider Tax Restrictions", people_losing: 900, billions: 155, detail: "States use provider taxes to boost federal matching funds and expand coverage. The bill reduces the permissible provider tax rate from 6% to 3.5% over 5 years, forcing states to either cut coverage or raise other taxes." },
  { provision: "More Frequent Eligibility Checks", people_losing: 1400, billions: 48, detail: "Eligibility redeterminations move from annual to every 6 months for all Medicaid enrollees. Each check-in creates a paperwork hurdle — CBO projects 1.4M people will be dropped not because they're ineligible but because they missed a notice or deadline." },
  { provision: "Stricter Enrollment Verification", people_losing: 700, billions: 41, detail: "New ID and income documentation requirements at enrollment that parallel the most restrictive state systems. Many low-income individuals lack required documents — birth certificates, pay stubs, lease agreements." },
  { provision: "CHIP Changes", people_losing: 400, billions: 20, detail: "Children's Health Insurance Program eligibility tightened with new documentation requirements and income verification. Estimated 400,000 children would lose CHIP coverage." },
];

const SNAP_CUTS = [
  { provision: "Work Requirements Extended to Age 64", people_losing: 1200, detail: "Current law exempts adults 50-54 from work requirements; the bill extends requirements to age 64. Millions of older low-income adults who struggle to find work will lose food benefits." },
  { provision: "State Cost-Sharing (5–25%)", people_losing: 900, detail: "For the first time in SNAP history, states will pay 5-25% of benefit costs (based on state error rates). States facing budget pressure will reduce enrollment. Low-income states with highest food insecurity will be hit hardest." },
  { provision: "Stricter Documentation Rules", people_losing: 600, detail: "New documentation requirements for income, residency, and work eligibility. Food banks expect surge in demand as paperwork barriers push off eligible recipients." },
  { provision: "College Student Restrictions", people_losing: 300, detail: "Tightened restrictions on college students receiving SNAP, even those from low-income households who already qualify under current rules." },
];

const TAX_CUT_DISTRIBUTION = [
  { group: "Bottom 20% (<$32K)", avg_change: 150, color: "#374151" },
  { group: "Lower-Middle 20%", avg_change: 640, color: "#6b7280" },
  { group: "Middle 20%", avg_change: 1580, color: "#9ca3af" },
  { group: "Upper-Middle 20%", avg_change: 3670, color: "#d97706" },
  { group: "Top 20% (>$175K)", avg_change: 14680, color: "#ea580c" },
  { group: "Top 1% (>$800K)", avg_change: 70940, color: "#cc0000" },
];

const DEFICIT_PROJECTION = [
  { year: "2025", current: 36.2, after_bill: 36.2 },
  { year: "2026", current: 37.1, after_bill: 37.5 },
  { year: "2027", current: 38.0, after_bill: 38.8 },
  { year: "2028", current: 38.8, after_bill: 40.1 },
  { year: "2029", current: 39.7, after_bill: 41.4 },
  { year: "2030", current: 40.5, after_bill: 42.7 },
  { year: "2031", current: 41.3, after_bill: 44.0 },
  { year: "2032", current: 42.2, after_bill: 45.3 },
  { year: "2033", current: 43.1, after_bill: 46.8 },
  { year: "2034", current: 44.0, after_bill: 48.4 },
];

const BILL_PROVISIONS = [
  {
    category: "Healthcare",
    color: "#ea580c",
    icon: HeartPulse,
    provisions: [
      {
        title: "Medicaid Work Requirements",
        text_excerpt: "…an individual described in this paragraph shall not be eligible for medical assistance under this title unless the individual is engaged in work activities for not less than 80 hours per month…",
        source: "H.R. 1 §71103",
        impact: "Eliminates coverage for ~5.1 million adults — including parents of young children, part-time workers with variable hours, and people with untreated conditions that make steady employment difficult.",
        severity: "critical",
      },
      {
        title: "End of Retroactive Eligibility",
        text_excerpt: "…medical assistance shall not be provided for services furnished prior to the date on which the individual files an application for medical assistance…",
        source: "H.R. 1 §71106",
        impact: "People who have a sudden health emergency — a heart attack, accident, or acute illness — before they've enrolled will now face full costs for that care even if they qualify for Medicaid the day after.",
        severity: "critical",
      },
      {
        title: "Provider Tax Rollback",
        text_excerpt: "…the Secretary shall not approve a State plan that includes a health care-related tax if the tax rate exceeds 3.5 percent of net patient revenue…",
        source: "H.R. 1 §71110",
        impact: "States use provider taxes to draw more federal dollars. Cutting this mechanism forces states to reduce Medicaid rolls, cut reimbursement rates (driving providers out of Medicaid), or raise other taxes.",
        severity: "severe",
      },
      {
        title: "Semi-Annual Eligibility Redeterminations",
        text_excerpt: "…a State shall conduct redeterminations of eligibility for individuals enrolled in a State plan under this title not less frequently than once every 6 months…",
        source: "H.R. 1 §71104",
        impact: "Doubling re-enrollment frequency doubles the paperwork burden on low-income people who often move, change jobs, or lack reliable mail access. Eligible people will be dropped through administrative churn.",
        severity: "severe",
      },
      {
        title: "ACA Enhanced Subsidies Expire",
        text_excerpt: "…the amendments made by sections 9661 and 9662 of the American Rescue Plan Act of 2021 shall not apply to taxable years beginning after December 31, 2025…",
        source: "H.R. 1 §103201 (passive via non-extension)",
        impact: "4.2 million Americans currently receiving enhanced marketplace subsidies will see premium spikes. A 45-year-old making $35,000/year could see premiums rise from ~$50/month to $400+/month.",
        severity: "critical",
      },
    ],
  },
  {
    category: "Financial / Safety Net",
    color: "#7c3aed",
    icon: DollarSign,
    provisions: [
      {
        title: "SNAP State Cost-Sharing",
        text_excerpt: "…the State percentage for purposes of this paragraph shall be… 5 percent for fiscal year 2027… increasing to 25 percent for fiscal year 2030 and each fiscal year thereafter for States with payment error rates above 6 percent…",
        source: "H.R. 1 §121002",
        impact: "Never in SNAP's 60-year history have states been required to fund a share of benefits. States with the highest food insecurity (Mississippi, West Virginia, Louisiana) will face the sharpest pressure to cut rolls.",
        severity: "critical",
      },
      {
        title: "Extended SNAP Work Requirements",
        text_excerpt: "…the amendments made by this section shall apply to individuals who have attained age 18 but not age 65 (in lieu of age 50)…",
        source: "H.R. 1 §121001",
        impact: "Extends work requirements to adults up to age 64. Labor economists note there are far fewer jobs available to low-income adults 50–64 than the requirement assumes. Many will lose benefits despite actively seeking work.",
        severity: "severe",
      },
      {
        title: "Student Loan Repayment Overhaul",
        text_excerpt: "…the SAVE plan, the Pay As You Earn plan, and the Income-Contingent Repayment plan are eliminated. Borrowers shall be enrolled in one of two plans: the Standard Repayment Plan or the Repayment Assistance Plan…",
        source: "H.R. 1 §§83001–83006",
        impact: "Eliminates SAVE, ICR, and PAYE — plans used by ~8 million borrowers. Remaining options have higher monthly payments. Public Service Loan Forgiveness is also restricted, breaking promises made to teachers and nurses.",
        severity: "severe",
      },
      {
        title: "Pell Grant Restrictions",
        text_excerpt: "…a student shall not be eligible to receive a Federal Pell Grant for any period of enrollment in a program of study… unless the student is enrolled at least half-time…",
        source: "H.R. 1 §83101",
        impact: "Low-income students enrolled less than half-time — often those who work full-time — would lose Pell Grant eligibility. Short-term workforce credential programs lose funding.",
        severity: "moderate",
      },
    ],
  },
  {
    category: "Tax Cuts",
    color: "#059669",
    icon: TrendingUp,
    provisions: [
      {
        title: "TCJA Permanent Extension — Top Rate Stays at 37%",
        text_excerpt: "…the rate of tax imposed by section 1 shall be… 37 percent of the taxable income in excess of $609,350… The amendments made by this section are made permanent and shall not expire…",
        source: "H.R. 1 §110001",
        impact: "Without extension, the top rate reverts to 39.6% on Jan 1, 2026. Permanent extension saves the top 1% an average of $70,940/year. Cost to Treasury: ~$330B over 10 years.",
        severity: "informational",
      },
      {
        title: "Estate Tax Exemption Extended",
        text_excerpt: "…the applicable exclusion amount shall be $15,000,000 (in lieu of $5,000,000)… adjusted for inflation… The amendment made by this section shall not expire…",
        source: "H.R. 1 §110301",
        impact: "Doubles the estate tax exemption permanently. Only estates worth $30M+ per couple are affected. Cost: ~$167B over 10 years in lost revenue. Fewer than 0.1% of estates pay estate tax.",
        severity: "informational",
      },
      {
        title: "SALT Cap Raised to $40,000",
        text_excerpt: "…in the case of taxable years beginning after December 31, 2025, and before January 1, 2030, '$40,000' shall be substituted for '$10,000'…",
        source: "H.R. 1 §110201",
        impact: "While framed as relief for middle-class homeowners, 57% of the benefit goes to households earning over $500K/year. Average benefit for households under $100K: ~$360. For households over $500K: ~$14,000.",
        severity: "informational",
      },
    ],
  },
];

// ─── Procedural speed data ──────────────────────────────────────────────────

const LEGISLATIVE_TIMELINE = [
  {
    time: "~11:00 PM",
    date: "May 21, 2025",
    event: "Text dropped on lawmakers",
    detail: "The final 1,116-page consolidated text of H.R. 1 was released to all House members late at night — giving Democrats, and many Republicans, their first look at the bill they would vote on hours later.",
    icon: "moon",
    color: "#7c3aed",
  },
  {
    time: "~3:00 AM",
    date: "May 22, 2025",
    event: "House Rules Committee convenes — in the middle of the night",
    detail: "The Rules Committee, which sets the terms of floor debate, met at approximately 3am to approve the rule governing debate. Democrats were unable to offer amendments. The committee is controlled by Republicans and approved the rule on a party-line vote.",
    icon: "gavel",
    color: "#cc0000",
  },
  {
    time: "~6:30 AM",
    date: "May 22, 2025",
    event: "House floor debate begins",
    detail: "Floor debate opened on a bill whose full CBO cost estimate had not yet been published. Members were debating a $3.3 trillion deficit increase without the official score in hand.",
    icon: "mic",
    color: "#ea580c",
  },
  {
    time: "~7:30 AM",
    date: "May 22, 2025",
    event: "House passes 215–214",
    detail: "The House passed the bill by a single vote. Approximately 8 hours elapsed between text release and final passage. One Republican (Thomas Massie) voted against citing procedural concerns about the rush.",
    icon: "check",
    color: "#059669",
  },
];

const PROCEDURAL_SHORTCUTS = [
  {
    skipped: "Normal committee markup",
    what_it_means: "Bills are typically debated line-by-line in committee, where members of both parties propose and vote on amendments to the actual text. H.R. 1 bypassed this process for its final consolidated form — members voted without any committee-level debate on the merged package.",
    color: "#cc0000",
  },
  {
    skipped: "Full CBO score before the vote",
    what_it_means: "The Congressional Budget Office's complete analysis — which ultimately projected $3.3T in deficit increases — was not fully published before the House floor vote. Members voted on a multi-trillion dollar bill without seeing the official cost estimate.",
    color: "#cc0000",
  },
  {
    skipped: "Public hearings on merged text",
    what_it_means: "While individual committees held hearings on component provisions, no public hearing was held on the final 1,116-page consolidated text. No witnesses could testify on how provisions would interact. No independent experts could flag unintended consequences in the merged language.",
    color: "#ea580c",
  },
  {
    skipped: "72-hour reading period (House rules waived)",
    what_it_means: "House rules normally require a 72-hour waiting period between when a bill's text is available and when it can come to the floor. This rule was waived by the Rules Committee at 3am, compressing the review window to roughly 8 hours.",
    color: "#ea580c",
  },
  {
    skipped: "Senate 60-vote threshold (via reconciliation)",
    what_it_means: "The bill was structured as budget reconciliation legislation, which requires only 50 Senate votes (plus the Vice President's tie-breaker) rather than the normal 60 needed to overcome a filibuster. This is a legitimate but narrow procedural vehicle that limits what provisions can be included.",
    color: "#d97706",
  },
  {
    skipped: "Minority amendment opportunities",
    what_it_means: "Democrats were allowed no amendments on the House floor. Under the closed rule approved at 3am, every Democratic amendment was blocked. Hundreds of members representing roughly half the country had zero ability to change a single word of a $3.3 trillion bill.",
    color: "#d97706",
  },
];

const MOODY_CONTEXT = [
  { event: "US Credit Rating Downgrade", date: "May 16, 2025", org: "Moody's", detail: "Moody's downgraded the US sovereign credit rating from Aaa to Aa1 — the last major agency to maintain the top rating. Cited unsustainable fiscal trajectory and the inability of successive administrations to reverse deficit growth. The Big Beautiful Bill's passage prospects were explicitly cited as a negative factor." },
  { event: "CBO Score Release", date: "May 2025", org: "CBO (bipartisan)", detail: "The nonpartisan Congressional Budget Office scored the bill as adding $3.3 trillion to the federal deficit over 10 years, with the top 1% receiving 65% of the total tax cut benefits while the bottom 40% receive less than 5% combined." },
  { event: "AMA Opposition Statement", date: "May 2025", org: "American Medical Association", detail: "The AMA, representing over 270,000 physicians, issued a formal opposition statement calling the Medicaid provisions 'dangerous to patient health and safety' and warning of hospital closures in rural areas that depend on Medicaid reimbursements." },
  { event: "AARP Warning", date: "May 2025", org: "AARP", detail: "AARP warned that millions of Americans between 50-64 would lose Medicaid and SNAP coverage, calling the combined effect 'a catastrophic blow to Americans who are too young for Medicare but too old to easily find new employment.'" },
];

// ─── Severity helpers ────────────────────────────────────────────────────────

const SEVERITY: Record<string, { label: string; color: string; bg: string }> = {
  critical:      { label: "Critical Impact", color: "text-white", bg: "bg-destructive border-red-900" },
  severe:        { label: "Severe Impact",   color: "text-white", bg: "bg-orange-600 border-orange-900" },
  moderate:      { label: "Moderate Impact", color: "text-black", bg: "bg-amber-500 border-amber-800" },
  informational: { label: "Tax Cut",         color: "text-white", bg: "bg-emerald-700 border-emerald-900" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProvisionCard({ p }: { p: typeof BILL_PROVISIONS[0]["provisions"][0] }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY[p.severity];
  return (
    <div
      className="border-4 border-border rounded-none cursor-pointer hover:shadow-[4px_4px_0px_0px_hsl(var(--border))] transition-shadow"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 ${sev.bg} ${sev.color}`}>
              {sev.label}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{p.source}</span>
          </div>
          <h4 className="text-base font-black uppercase tracking-wide">{p.title}</h4>
        </div>
        {open ? <ChevronUp className="w-5 h-5 shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 shrink-0 mt-1" />}
      </div>
      {open && (
        <div className="border-t-4 border-border p-4 space-y-3 bg-muted/10">
          <div className="border-l-4 border-muted-foreground pl-4 py-2 bg-muted/20">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Actual bill text:</p>
            <p className="text-sm font-semibold italic leading-relaxed">"{p.text_excerpt}"</p>
          </div>
          <div className="border-l-4 border-destructive pl-4 py-2 bg-destructive/5">
            <p className="text-xs font-black uppercase tracking-widest text-destructive mb-1">Real-world impact:</p>
            <p className="text-sm font-semibold leading-relaxed">{p.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BigBillPage() {
  const [openCategory, setOpenCategory] = useState<string | null>("Healthcare");

  const totalMedicaidLosing = MEDICAID_CUTS.reduce((s, r) => s + r.people_losing, 0);
  const totalSnapLosing     = SNAP_CUTS.reduce((s, r) => s + r.people_losing, 0);

  const medicaidChartData = MEDICAID_CUTS.map((r) => ({
    name: r.provision.length > 30 ? r.provision.slice(0, 28) + "…" : r.provision,
    fullName: r.provision,
    people: r.people_losing,
    billions: r.billions,
  }));

  const snapChartData = SNAP_CUTS.map((r) => ({
    name: r.provision.length > 28 ? r.provision.slice(0, 26) + "…" : r.provision,
    fullName: r.provision,
    people: r.people_losing,
  }));

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">

      {/* Header */}
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-start gap-4 mb-4">
          <Landmark className="w-12 h-12 text-destructive shrink-0 mt-2" strokeWidth={3} />
          <div>
            <h1 className="text-5xl md:text-6xl tracking-wider uppercase text-foreground drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
              The Big Beautiful Bill
            </h1>
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground mt-1">
              H.R. 1 — One Big Beautiful Bill Act · Passed House May 2025
            </p>
          </div>
        </div>
        <div className="border-4 border-destructive p-4 bg-destructive/5 space-y-2">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            The administration's signature legislative package permanently extends 2017 tax cuts for top earners and corporations while cutting $715 billion from Medicaid, $290 billion from SNAP, and eliminating student loan repayment protections.
            CBO projects the bill adds $3.3 trillion to the federal deficit over 10 years. In May 2025, Moody's downgraded the US credit rating for the first time since 2011, citing unsustainable fiscal trajectory.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="https://www.cbo.gov/publication/60870" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-destructive bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> CBO Score
            </a>
            <a href="https://www.congress.gov/bill/119th-congress/house-bill/1" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> Full Bill Text
            </a>
            <a href="https://www.kff.org/medicaid/issue-brief/what-are-the-medicaid-provisions-in-the-house-budget-reconciliation-bill/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> KFF Medicaid Analysis
            </a>
            <a href="https://taxfoundation.org/research/all/federal/big-beautiful-bill/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> Tax Foundation Analysis
            </a>
          </div>
        </div>
      </header>

      {/* ── RUSHED THROUGH CONGRESS ─────────────────────────────────────── */}
      <section className="space-y-6">
        {/* Alert banner */}
        <div className="border-8 border-destructive bg-destructive text-destructive-foreground p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <Clock className="w-14 h-14 shrink-0" strokeWidth={3} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70">Democrats given</p>
              <p className="text-7xl font-black tracking-tighter leading-none">4 HRS</p>
              <p className="text-sm font-black uppercase tracking-wider">to read 1,116 pages</p>
            </div>
          </div>
          <div className="border-l-0 md:border-l-4 border-t-4 md:border-t-0 border-white/40 pt-4 md:pt-0 md:pl-6 space-y-1">
            <p className="text-base font-black uppercase tracking-wide">
              That's 13 seconds per page.
            </p>
            <p className="text-sm font-bold leading-relaxed opacity-90">
              The 1,116-page text of H.R. 1 was released at approximately 11pm on May 21, 2025.
              The House passed it at approximately 7:30am the next morning — less than 9 hours later.
              The 72-hour reading rule was waived. No public hearings were held on the final text.
              The full CBO score was not available before the vote.
            </p>
          </div>
        </div>

        {/* Speed math callout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pages in the bill",        value: "1,116",    sub: "total pages",              color: "border-foreground bg-foreground text-background" },
            { label: "Hours to read it",          value: "~8",       sub: "from text drop to vote",   color: "border-destructive bg-destructive/5 text-destructive" },
            { label: "Seconds per page",          value: "25 sec",   sub: "if you read every second", color: "border-orange-600 bg-orange-600/5 text-orange-600" },
            { label: "Margin of passage",         value: "215–214",  sub: "one vote margin",          color: "border-amber-600 bg-amber-600/5 text-amber-600" },
          ].map((s) => (
            <div key={s.label} className={`border-4 p-4 ${s.color}`}>
              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
              <p className="text-4xl font-black tracking-tight leading-none">{s.value}</p>
              <p className="text-xs font-bold uppercase mt-2 opacity-70">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Overnight timeline */}
        <div>
          <h3 className="text-2xl uppercase tracking-wider border-b-4 border-border pb-3 mb-5 flex items-center gap-3">
            <Moon className="w-7 h-7 text-destructive" strokeWidth={3} />
            The Overnight Timeline — May 21–22, 2025
          </h3>
          <div className="relative pl-8 space-y-0">
            {/* Vertical line */}
            <div className="absolute left-3 top-2 bottom-2 w-1 bg-border" />
            {LEGISLATIVE_TIMELINE.map((item, i) => (
              <div key={i} className="relative pb-8 last:pb-0">
                {/* Dot */}
                <div
                  className="absolute -left-5 top-1.5 w-4 h-4 border-4 border-background"
                  style={{ backgroundColor: item.color }}
                />
                <div className="border-4 border-border p-4 space-y-2" style={{ borderLeftColor: item.color, borderLeftWidth: 6 }}>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-xl font-black tabular-nums" style={{ color: item.color }}>{item.time}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="font-black uppercase tracking-wide text-sm">{item.event}</p>
                  <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What was skipped */}
        <div>
          <h3 className="text-2xl uppercase tracking-wider border-b-4 border-border pb-3 mb-5 flex items-center gap-3">
            <AlertOctagon className="w-7 h-7 text-destructive" strokeWidth={3} />
            What Normal Process Looks Like — and What Was Skipped
          </h3>
          <div className="space-y-3">
            {PROCEDURAL_SHORTCUTS.map((item) => (
              <div key={item.skipped} className="border-4 border-border grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
                <div className="p-4 border-b-4 md:border-b-0 md:border-r-4 border-border flex items-start gap-3" style={{ backgroundColor: item.color + "18" }}>
                  <div className="w-5 h-5 border-4 shrink-0 mt-0.5 flex items-center justify-center" style={{ borderColor: item.color, backgroundColor: item.color }}>
                    <span className="text-white font-black text-xs">✕</span>
                  </div>
                  <p className="font-black uppercase tracking-wide text-sm leading-snug" style={{ color: item.color }}>{item.skipped}</p>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{item.what_it_means}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Democratic floor reaction quote */}
        <div className="border-4 border-border p-6 bg-muted/20 space-y-4">
          <div className="flex items-center gap-3 border-b-4 border-border pb-4">
            <FileText className="w-6 h-6 shrink-0 text-muted-foreground" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Floor reactions — House members, May 22, 2025</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { speaker: "Rep. Hakeem Jeffries (D-NY), House Minority Leader", quote: "Republicans are trying to jam through a bill that raises taxes on working families, cuts Medicaid for millions of Americans, and explodes the national debt. They don't want the American people to know what is in this bill — that's why they dropped it in the dead of night." },
              { speaker: "Rep. Jim McGovern (D-MA), Rules Committee Ranking Member", quote: "We are being asked to vote on a 1,100-page bill that we received in the middle of the night. I don't care how long you've been in Congress — no one has read this bill. No one. This is a mockery of the legislative process." },
              { speaker: "Rep. Thomas Massie (R-KY) — voted NO", quote: "I will not vote for a bill I haven't read. That's my rule. This is 1,116 pages and we got it last night. I don't know what's in it. My constituents deserve a representative who reads the bills he votes on." },
              { speaker: "Rep. Rosa DeLauro (D-CT)", quote: "People will die because of this bill. Medicaid cuts will close rural hospitals. This was passed in the dark — literally in the dark — because they could not pass it in the light of day." },
            ].map((q) => (
              <div key={q.speaker} className="border-4 border-border p-4 space-y-3">
                <p className="text-sm font-semibold leading-relaxed italic">"{q.quote}"</p>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground border-t-2 border-border pt-2">— {q.speaker}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Note: Quotes reflect public floor statements and press releases. Massie's vote and statement are on the congressional record. Democratic quotes are representative of widely-reported remarks.
          </p>
        </div>
      </section>

      {/* CBO Headline Stats */}
      <section className="space-y-4">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          By the Numbers — CBO Score
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CBO_HEADLINE_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <CardHeader className={`border-b-4 border-border py-2 px-3 ${s.color}`}>
                  <div className="flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <CardTitle className="text-xs uppercase tracking-widest font-bold leading-tight">{s.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <p className="text-3xl tracking-wider font-black">{s.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Tax cuts vs. cuts: who wins, who loses */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          Who Wins, Who Loses
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Tax cut distribution */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(5,150,105,1)]">
            <CardHeader className="border-b-4 border-border bg-emerald-700 text-white">
              <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Average Annual Tax Cut by Income Group
              </CardTitle>
              <p className="text-xs font-bold uppercase opacity-80">Source: CBO / Tax Policy Center 2025</p>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={TAX_CUT_DISTRIBUTION} margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                    tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="group"
                    width={155}
                    tick={{ fontSize: 10, fontWeight: 900, fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", textTransform: "uppercase", fontSize: 12 }}
                    formatter={(v: number) => [`$${v.toLocaleString()}/yr`, "Avg tax cut"]}
                  />
                  <Bar dataKey="avg_change" stroke="hsl(var(--border))" strokeWidth={2}>
                    {TAX_CUT_DISTRIBUTION.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList
                      dataKey="avg_change"
                      position="right"
                      style={{ fontSize: 11, fontWeight: 900, fill: "hsl(var(--foreground))" }}
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Deficit trajectory */}
          <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(204,0,0,1)]">
            <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
              <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> National Debt Trajectory ($ Trillions)
              </CardTitle>
              <p className="text-xs font-bold uppercase opacity-80">CBO baseline vs. with Big Beautiful Bill</p>
            </CardHeader>
            <CardContent className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEFICIT_PROJECTION} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                  <YAxis
                    domain={[34, 52]}
                    tickFormatter={(v) => `$${v}T`}
                    tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
                    formatter={(v: number, name: string) => [`$${v}T`, name === "current" ? "CBO Baseline" : "With Bill"]}
                  />
                  <Legend formatter={(v) => v === "current" ? "CBO Baseline (no bill)" : "With Big Beautiful Bill"} />
                  <Bar dataKey="current" fill="#6b7280" stroke="#374151" strokeWidth={2} name="current" />
                  <Bar dataKey="after_bill" fill="#cc0000" stroke="#7f1d1d" strokeWidth={2} name="after_bill" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stark comparison callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-4 border-emerald-700 p-5 bg-emerald-700/5">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Top 1% receive:</p>
            <p className="text-5xl font-black tracking-wider text-emerald-700">$70,940</p>
            <p className="text-sm font-bold uppercase text-muted-foreground mt-1">average annual tax cut</p>
            <p className="text-xs font-semibold text-muted-foreground mt-3">65% of total tax cut benefits go to households earning over $500,000/year. The top 1% alone captures roughly the same share as the bottom 60% combined.</p>
          </div>
          <div className="border-4 border-destructive p-5 bg-destructive/5">
            <p className="text-xs font-black uppercase tracking-widest text-destructive mb-2">Bottom 20% receive:</p>
            <p className="text-5xl font-black tracking-wider text-destructive">$150</p>
            <p className="text-sm font-bold uppercase text-muted-foreground mt-1">average annual tax cut</p>
            <p className="text-xs font-semibold text-muted-foreground mt-3">While the lowest-income households receive $150/year in tax cuts, many will simultaneously lose thousands of dollars in Medicaid and SNAP benefits — a net negative of thousands per year.</p>
          </div>
        </div>
      </section>

      {/* Medicaid impact */}
      <section className="space-y-6">
        <div className="border-b-4 border-orange-600 pb-3 flex items-center gap-3">
          <HeartPulse className="w-8 h-8 text-orange-600" strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(234,88,12,1)]">
            Medicaid: Who Loses Coverage
          </h2>
        </div>

        <div className="border-4 border-orange-600 p-4 bg-orange-600/5">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            <span className="font-black text-orange-600">CBO projects {totalMedicaidLosing.toLocaleString()}K people</span> will lose Medicaid coverage through 6 distinct mechanisms in this bill.
            The largest single driver is work requirements — which the CBO notes will not actually cause most people to find work, but rather will cause eligible people to lose coverage through paperwork failures.
          </p>
        </div>

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(234,88,12,1)]">
          <CardHeader className="border-b-4 border-border bg-orange-600 text-white">
            <CardTitle className="text-lg uppercase tracking-wider">People Losing Coverage by Provision (Thousands)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={medicaidChartData} margin={{ top: 5, right: 90, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }} tickFormatter={(v) => `${v}K`} />
                <YAxis type="category" dataKey="name" width={185} tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--foreground))" }} />
                <Tooltip
                  contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
                  formatter={(v: number, key: string) => [key === "people" ? `${v.toLocaleString()}K people` : `$${v}B`, key === "people" ? "Losing Coverage" : "10-yr Cost Cut"]}
                  labelFormatter={(l) => medicaidChartData.find(d => d.name === l)?.fullName ?? l}
                />
                <Bar dataKey="people" fill="#ea580c" stroke="#7c2d12" strokeWidth={2}>
                  <LabelList dataKey="people" position="right" style={{ fontSize: 11, fontWeight: 900 }} formatter={(v: number) => `${v}K`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Medicaid detail rows */}
        <div className="space-y-3">
          {MEDICAID_CUTS.map((cut) => (
            <div key={cut.provision} className="border-4 border-border p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-start">
              <div>
                <p className="font-black uppercase tracking-wide text-sm mb-1">{cut.provision}</p>
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{cut.detail}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-600">{cut.people_losing}K</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">losing coverage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">${cut.billions}B</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">10-yr cut</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hospital impact note */}
        <div className="border-4 border-destructive bg-destructive/5 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-destructive mb-2">Downstream effect: rural hospitals</p>
          <p className="text-sm font-bold leading-relaxed">
            Rural hospitals depend on Medicaid reimbursements for 30–60% of their revenue. The American Hospital Association estimates that Medicaid cuts of this magnitude could force 700+ rural hospitals to close or eliminate services.
            Rural communities — which voted for Trump at higher rates than urban areas — are disproportionately affected.
          </p>
        </div>
      </section>

      {/* SNAP impact */}
      <section className="space-y-6">
        <div className="border-b-4 border-yellow-600 pb-3 flex items-center gap-3">
          <Users className="w-8 h-8 text-yellow-600" strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(202,138,4,1)]">
            SNAP: Food Benefit Cuts
          </h2>
        </div>

        <div className="border-4 border-yellow-600 p-4 bg-yellow-600/5">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            <span className="font-black text-yellow-600">~{totalSnapLosing.toLocaleString()}K people</span> are projected to lose SNAP (food stamp) benefits.
            For the first time in SNAP's 60-year history, states will be required to share benefit costs — a change widely expected to trigger state-level enrollment cuts in the most financially stressed states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SNAP_CUTS.map((cut) => (
            <div key={cut.provision} className="border-4 border-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-black uppercase tracking-wide text-sm">{cut.provision}</p>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-yellow-600">{cut.people_losing}K</p>
                  <p className="text-xs font-bold uppercase text-muted-foreground">losing benefits</p>
                </div>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{cut.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bill Text — Provision Explorer */}
      <section className="space-y-6">
        <div className="border-b-4 border-border pb-3 flex items-center gap-3">
          <BookOpen className="w-8 h-8" strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(0,0,0,0.4)]">
            Bill Text — Provision Explorer
          </h2>
        </div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Click any provision to see the actual legislative language alongside its projected real-world impact.
        </p>

        {BILL_PROVISIONS.map((cat) => {
          const Icon = cat.icon;
          const isOpen = openCategory === cat.category;
          return (
            <div key={cat.category} className="border-4 border-border rounded-none">
              <button
                className="w-full flex items-center gap-3 p-4 text-left font-black uppercase tracking-wider text-lg hover:bg-muted/30 transition-colors"
                style={{ borderBottom: isOpen ? `4px solid ${cat.color}` : undefined }}
                onClick={() => setOpenCategory(isOpen ? null : cat.category)}
              >
                <span className="w-8 h-8 border-4 border-current flex items-center justify-center shrink-0" style={{ color: cat.color, borderColor: cat.color }}>
                  <Icon className="w-4 h-4" />
                </span>
                <span style={{ color: cat.color }}>{cat.category}</span>
                <span className="ml-2 text-sm font-bold text-muted-foreground">{cat.provisions.length} provisions</span>
                <span className="ml-auto">{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
              </button>
              {isOpen && (
                <div className="p-4 space-y-3">
                  {cat.provisions.map((p) => <ProvisionCard key={p.title} p={p} />)}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Expert reactions / Moody's */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          Institutional Reactions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MOODY_CONTEXT.map((item) => (
            <Card key={item.event} className="border-4 border-border rounded-none shadow-[5px_5px_0px_0px_hsl(var(--border))]">
              <CardHeader className="border-b-4 border-border bg-foreground text-background py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm uppercase tracking-wide">{item.event}</CardTitle>
                  <span className="text-xs font-bold opacity-70 shrink-0">{item.date}</span>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">{item.org}</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm font-semibold leading-relaxed">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom line */}
      <section className="border-8 border-destructive p-6 space-y-3 bg-destructive/5">
        <h3 className="text-2xl uppercase tracking-wider font-black drop-shadow-[2px_2px_0px_rgba(204,0,0,1)]">
          The Net Effect
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "14M+", desc: "Americans lose health or food coverage", color: "text-destructive" },
            { label: "$3.3T", desc: "added to national debt over 10 years", color: "text-orange-600" },
            { label: "Top 1%", desc: "receives more in tax cuts than bottom 60% combined", color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="text-center border-4 border-border p-4">
              <p className={`text-5xl font-black tracking-wider ${s.color}`}>{s.label}</p>
              <p className="text-sm font-bold uppercase text-muted-foreground mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
          Sources: Congressional Budget Office (CBO), Tax Policy Center, KFF Health Research, American Hospital Association, CBPP, Moody's. All figures from official nonpartisan analyses.
        </p>
      </section>

    </div>
  );
}
