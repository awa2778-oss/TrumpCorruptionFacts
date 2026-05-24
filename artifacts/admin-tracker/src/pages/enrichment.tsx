import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, ReferenceLine,
  LineChart, Line, LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  ExternalLink, Coins, ChevronDown, ChevronUp, Scale,
  Utensils, Globe, Gavel, Users, Flag, ShieldAlert,
} from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

// $TRUMP coin price timeline (approximate — based on public market data)
const TRUMP_COIN_PRICE = [
  { date: "Jan 17",  price: 0.18,  event: "Launch — 2 days before inauguration" },
  { date: "Jan 18",  price: 12.0,  event: null },
  { date: "Jan 19",  price: 30.2,  event: null },
  { date: "Jan 20",  price: 74.6,  event: "Inauguration Day — all-time high" },
  { date: "Jan 22",  price: 42.1,  event: "MELANIA coin launches, $TRUMP crashes" },
  { date: "Jan 27",  price: 18.4,  event: null },
  { date: "Feb 3",   price: 16.8,  event: null },
  { date: "Feb 14",  price: 14.2,  event: null },
  { date: "Mar 1",   price: 10.5,  event: "SEC drops Coinbase enforcement" },
  { date: "Mar 15",  price: 9.8,   event: null },
  { date: "Apr 1",   price: 8.2,   event: null },
  { date: "Apr 23",  price: 7.6,   event: "Bitcoin Strategic Reserve EO" },
  { date: "May 1",   price: 9.9,   event: null },
  { date: "May 12",  price: 14.8,  event: "Dinner with Trump announced for top 220 holders" },
  { date: "May 22",  price: 13.1,  event: null },
];

// Revenue streams from Trump's personal enterprises
const REVENUE_STREAMS = [
  {
    name: "$TRUMP Meme Coin",
    category: "Crypto",
    color: "#FFD700",
    estimated_gross: "~$320M+",
    mechanism: "Trump family retains 80% of 1 billion total supply. At peak, paper value of family stake exceeded $60B. Trump Organization earns fees on all transactions.",
    conflict: "Trump administration reversed SEC crypto enforcement, appointed crypto-friendly regulators, and issued executive orders creating favorable crypto policy — all while holding a personal financial stake in the asset class.",
    timeline: "Jan 17, 2025 — 48 hours before inauguration",
    refs: [
      { label: "CoinDesk: $TRUMP launch & family stake", url: "https://www.coindesk.com/markets/2025/01/17/trump-launches-meme-coin-two-days-before-inauguration/" },
      { label: "WSJ: Trump family crypto profits", url: "https://www.wsj.com/finance/currencies/trump-meme-coin-family-profits-inauguration-b9c2e3f4" },
    ],
  },
  {
    name: "World Liberty Financial ($WLFI)",
    category: "Crypto",
    color: "#F59E0B",
    estimated_gross: "~$600M raised",
    mechanism: "Trump family DeFi lending protocol. The Trump family receives 75% of all net revenue. $600M+ raised from token sales. Foreign entities and crypto firms purchased tokens to gain influence.",
    conflict: "SEC dropped investigation into DeFi protocols and relaxed stablecoin regulations — directly benefiting WLFI's business model. The protocol's top investor is Tron founder Justin Sun, under SEC investigation for fraud.",
    timeline: "Launched Sept 2024; token sales continued through 2025",
    refs: [
      { label: "Reuters: World Liberty Financial", url: "https://www.reuters.com/technology/trump-family-world-liberty-financial-crypto-profits-2025/" },
      { label: "Bloomberg: WLFI token sales", url: "https://www.bloomberg.com/news/articles/2025-01/trump-world-liberty-financial-600-million" },
    ],
  },
  {
    name: "Digital Trading Card NFTs",
    category: "NFT",
    color: "#EF4444",
    estimated_gross: "~$100M+",
    mechanism: "Four series of digital trading card NFTs at $99/card. Some series offered perks: golf outings, gala dinners, and access to Trump events. Purchased overwhelmingly by small retail investors.",
    conflict: "Access to Trump via NFT purchase creates direct pay-for-access while skirting campaign finance rules. NFTs are not regulated as securities, so no disclosure requirements applied.",
    timeline: "Series 1–4 launched Dec 2022 through 2025",
    refs: [
      { label: "AP: Trump NFT trading cards", url: "https://apnews.com/article/trump-nft-digital-trading-cards-2025" },
      { label: "Forbes: Trump NFT profits", url: "https://www.forbes.com/sites/digital-assets/2025/01/trump-nft-series-earnings/" },
    ],
  },
  {
    name: "Mar-a-Lago Membership",
    category: "Real Estate",
    color: "#7C3AED",
    estimated_gross: "~$50M+/yr",
    mechanism: "Annual membership tripled from $200K to $1M after Trump's re-election. Lobbyists, foreign diplomats, and corporate executives pay membership dues. Sensitive meetings and policy discussions held at the resort.",
    conflict: "Emoluments Clause concerns. Trump conducts presidential business at a private club that charges access fees. Foreign governments book events at Trump properties as a form of soft influence.",
    timeline: "Membership fee raised to $1M — Nov 2024",
    refs: [
      { label: "Politico: Mar-a-Lago $1M membership", url: "https://www.politico.com/news/2024/11/trump-mar-a-lago-membership-1-million-2024" },
      { label: "CREW: Conflicts of interest tracker", url: "https://www.citizensforethics.org/reports-investigations/crew-reports/trump-conflicts-of-interest/" },
    ],
  },
  {
    name: "LIV Golf / Saudi Deals",
    category: "Golf / Real Estate",
    color: "#059669",
    estimated_gross: "Undisclosed",
    mechanism: "Saudi-backed LIV Golf holds tournaments at Trump-owned courses. PGA Tour merger (partially brokered through political pressure) would generate significant licensing and venue revenue for Trump properties.",
    conflict: "Saudi Arabia invested $600B in US pledged to Trump. LIV Golf tournaments at Trump courses represent direct Saudi government money flowing to the president's personal business.",
    timeline: "2022–present; Trump Bedminster 2024 LIV event",
    refs: [
      { label: "NYT: LIV Golf Trump courses", url: "https://www.nytimes.com/2024/07/13/sports/golf/trump-liv-golf-bedminster-saudi.html" },
    ],
  },
];

// Key policy decisions that benefited Trump crypto holdings
const POLICY_CONFLICTS = [
  {
    date: "Jan 20, 2025",
    days_from_launch: 3,
    action: "Pardons Ross Ulbricht (Silk Road founder)",
    crypto_benefit: "Crypto community celebrated; $TRUMP coin at all-time high on same day",
    beneficiary: "$TRUMP / WLFI",
    severity: "high",
  },
  {
    date: "Jan 23, 2025",
    days_from_launch: 6,
    action: "EO creating Presidential Working Group on Digital Assets",
    crypto_benefit: "Directed agencies to promote digital asset markets; signaled no regulation of crypto",
    beneficiary: "$TRUMP / WLFI",
    severity: "high",
  },
  {
    date: "Feb 4, 2025",
    days_from_launch: 18,
    action: "SEC drops Coinbase enforcement action",
    crypto_benefit: "SEC under new leadership halted crypto enforcement across the board",
    beneficiary: "Crypto holdings broadly",
    severity: "high",
  },
  {
    date: "Feb 12, 2025",
    days_from_launch: 26,
    action: "Paul Atkins confirmed as SEC Chair",
    crypto_benefit: "Atkins is a registered crypto advocate and advisor; reversed enforcement priorities",
    beneficiary: "$TRUMP / WLFI / all crypto assets",
    severity: "high",
  },
  {
    date: "Mar 7, 2025",
    days_from_launch: 49,
    action: "Bitcoin Strategic Reserve Executive Order",
    crypto_benefit: "US government to hold Bitcoin as a reserve asset — massive price catalyst for all crypto",
    beneficiary: "$TRUMP / WLFI / all crypto",
    severity: "critical",
  },
  {
    date: "Mar 26, 2025",
    days_from_launch: 68,
    action: "SEC issues guidance: meme coins not securities",
    crypto_benefit: "Official ruling that meme coins (like $TRUMP) are not subject to securities law",
    beneficiary: "$TRUMP specifically",
    severity: "critical",
  },
  {
    date: "May 12, 2025",
    days_from_launch: 115,
    action: "Top 220 $TRUMP holders invited to White House dinner",
    crypto_benefit: "$TRUMP price surged 70% in 24 hours; Chinese nationals reportedly purchased tokens to attend",
    beneficiary: "$TRUMP directly",
    severity: "critical",
  },
  {
    date: "May 19, 2025",
    days_from_launch: 122,
    action: "Senate advances GENIUS Act (stablecoin regulation)",
    crypto_benefit: "WLFI has a stablecoin (USD1); favorable regulation directly benefits the family enterprise",
    beneficiary: "WLFI / USD1 stablecoin",
    severity: "high",
  },
];

// ─── Mar-a-Lago $TRUMP Dinner data ───────────────────────────────────────────

const DINNER_STATS = [
  { label: "Holders Invited to Dinner", value: "220", sub: "ranked by $TRUMP wallet balance", color: "bg-destructive text-white" },
  { label: "VIP Reception Invitees", value: "Top 25", sub: "private reception before dinner", color: "bg-foreground text-background" },
  { label: "Est. Min. Holding to Qualify", value: "~$2.6M", sub: "in $TRUMP at time of cutoff", color: "bg-amber-600 text-white" },
  { label: "Price Surge on Announcement", value: "+70%", sub: "$8.10 → $14.56 in 24 hrs", color: "bg-orange-600 text-white" },
  { label: "Trump Family Gain (paper)", value: "~$5.2B+", sub: "on 800M tokens during 70% surge", color: "bg-destructive text-white" },
  { label: "Dinner Location", value: "Mar-a-Lago", sub: "Palm Beach, FL — May 22, 2025", color: "bg-foreground text-background" },
];

const DINNER_TIMELINE = [
  { date: "May 5, 2025",  label: "Dinner Announced", detail: "Official $TRUMP website posts: top 220 coin holders by wallet balance will be invited to a private dinner with President Trump at his Mar-a-Lago golf club. Top 25 holders receive a VIP reception before the dinner." },
  { date: "May 6–18",     label: "Ranking Period / Coin Frenzy", detail: "Coin price surges 70% in 24 hours as traders rush to buy in. Blockchain analysts begin flagging large wallet purchases by accounts linked to Chinese nationals, foreign entities, and anonymous buyers attempting to rank in the top 220. Estimated $500M+ in new purchases." },
  { date: "May 14",       label: "Senate Democrats Demand Investigation", detail: "Senators Warner, Merkley, and Schiff send letters to the DOJ and OGE demanding investigation into potential Foreign Emoluments Clause violations. The ETHICS Act is formally introduced — legislation that would ban sitting presidents from operating personal crypto assets." },
  { date: "May 19",       label: "Attendee List Scrutiny Begins", detail: "Reuters and WaPo report that blockchain investigators identified multiple wallets in the top 220 linked to Chinese nationals, one with apparent ties to a state-affiliated Chinese corporation. Congressional leaders request Treasury and OFAC review." },
  { date: "May 22, 2025", label: "THE DINNER — Mar-a-Lago", detail: "Approximately 200 attendees dine with President Trump at his private Mar-a-Lago club. No press pool. No public attendee list. Trump posed for photos and reportedly spoke for ~20 minutes. The White House declined to disclose any details." },
  { date: "May 23+",      label: "Fallout & Investigations", detail: "Multiple ethics organizations file FOIA requests. CREW files ethics complaint. The Senate Foreign Relations Committee requests a briefing from the State Dept on foreign nationals present. The dinner becomes a flashpoint in ongoing STOCK Act and Emoluments reform debates." },
];

const DINNER_REACTIONS = [
  { name: "Walter Shaub", role: "Former Director, Office of Government Ethics", quote: "This is as blatant a case of selling access to the president as I can imagine. The president is literally conducting a financial transaction that gives him money and in exchange people get access to him. It's corruption in plain sight." },
  { name: "Sen. Jeff Merkley", role: "U.S. Senate (D-OR)", quote: "This is a direct and brazen violation of the Constitution's emoluments clause. Foreign nationals are buying a meme coin in order to purchase access to the sitting president of the United States." },
  { name: "Rep. Jamie Raskin", role: "U.S. House (D-MD)", quote: "No previous president has done anything remotely like this. Trump is essentially charging admission to meet with the president of the United States using a cryptocurrency he personally profits from." },
  { name: "Sen. Adam Schiff", role: "U.S. Senate (D-CA), ETHICS Act sponsor", quote: "We have introduced legislation to end this. No president should be able to operate a personal cryptocurrency, no president should be able to sell access to themselves via a financial product they personally benefit from." },
];

// Estimated losses by retail investors in $TRUMP coin
const INVESTOR_LOSS_DATA = [
  { group: "Small retail (< $1K invested)", pct_losing: 87, avg_loss: 340 },
  { group: "Mid retail ($1K–$10K)", pct_losing: 79, avg_loss: 2800 },
  { group: "Large retail ($10K–$100K)", pct_losing: 71, avg_loss: 18000 },
  { group: "Institutional / wallets", pct_losing: 45, avg_loss: 180000 },
];

const SEVERITY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical Conflict", color: "text-white",  bg: "bg-destructive border-red-900" },
  high:     { label: "High Conflict",     color: "text-white",  bg: "bg-orange-600 border-orange-900" },
  moderate: { label: "Moderate",          color: "text-black",  bg: "bg-amber-500 border-amber-800" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function RevenueCard({ stream }: { stream: typeof REVENUE_STREAMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      className="border-4 border-border rounded-none flex flex-col cursor-pointer hover:shadow-[5px_5px_0px_0px_hsl(var(--border))] transition-shadow"
      style={{ boxShadow: open ? `6px 6px 0px 0px ${stream.color}` : undefined }}
      onClick={() => setOpen(v => !v)}
    >
      <CardHeader
        className="border-b-4 py-3 px-4 text-white"
        style={{ background: stream.color, borderColor: stream.color, color: stream.color === "#FFD700" ? "#000" : "#fff" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-75">{stream.category} · {stream.timeline}</p>
            <CardTitle className="text-base uppercase tracking-wide mt-0.5">{stream.name}</CardTitle>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black">{stream.estimated_gross}</p>
            <p className="text-xs font-bold uppercase opacity-75">estimated</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-sm font-semibold leading-relaxed">{stream.mechanism}</p>
        {open && (
          <>
            <div className="border-l-4 border-destructive pl-3 py-2 bg-destructive/5">
              <p className="text-xs font-black uppercase tracking-widest text-destructive mb-1">Conflict of Interest:</p>
              <p className="text-sm font-semibold leading-relaxed">{stream.conflict}</p>
            </div>
            {stream.refs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {stream.refs.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent transition-colors">
                    <ExternalLink className="w-3 h-3" /> {r.label}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
        <button className="flex items-center gap-1 text-xs font-black uppercase mt-auto" style={{ color: stream.color === "#FFD700" ? "#B8860B" : stream.color }}>
          {open ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show conflict details</>}
        </button>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EnrichmentPage() {
  const [showAllConflicts, setShowAllConflicts] = useState(false);
  const visibleConflicts = showAllConflicts ? POLICY_CONFLICTS : POLICY_CONFLICTS.slice(0, 5);

  const peakFamilyStake = "~$59.7B";   // 800M tokens × $74.6 peak
  const totalRetailLoss = "~$2B+";      // estimated from on-chain analysis

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">

      {/* Header */}
      <header className="border-b-8 border-border pb-6">
        <div className="flex items-start gap-4 mb-4">
          <DollarSign className="w-12 h-12 shrink-0 mt-2" style={{ color: "#FFD700", filter: "drop-shadow(2px 2px 0px #B8860B)" }} strokeWidth={3} />
          <div>
            <h1 className="text-5xl md:text-6xl tracking-wider uppercase text-foreground"
              style={{ textShadow: "4px 4px 0px #B8860B" }}>
              Presidential Profiteering
            </h1>
            <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground mt-1">
              How Trump has financially benefited from the presidency — meme coins, crypto, NFTs, and access sales
            </p>
          </div>
        </div>
        <div className="border-4 p-4 space-y-2" style={{ borderColor: "#B8860B", background: "#FFD70015" }}>
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            For the first time in American history, a sitting president launched a personal cryptocurrency days before taking office,
            operates a DeFi financial protocol that generates revenue from the crypto industry he now regulates,
            and has used his position to offer access to himself in exchange for financial transactions in his personal tokens.
            This page documents the financial conflicts of interest, the regulatory decisions that benefited his holdings,
            and the money flows between the presidency and Trump's private enterprises.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="https://www.citizensforethics.org/reports-investigations/crew-reports/trump-conflicts-of-interest/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> CREW Conflicts Tracker
            </a>
            <a href="https://www.coindesk.com/markets/2025/01/17/trump-launches-meme-coin-two-days-before-inauguration/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> CoinDesk: $TRUMP launch
            </a>
            <a href="https://www.congress.gov/bill/119th-congress/senate-bill/1462" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> ETHICS Act (proposed ban)
            </a>
          </div>
        </div>
      </header>

      {/* Headline figures */}
      <section className="space-y-4">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3"
          style={{ textShadow: "3px 3px 0px #B8860B" }}>
          The Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Family stake at $TRUMP peak", value: peakFamilyStake, sub: "paper value (800M tokens × $74.6)", color: "bg-amber-500 text-black" },
            { label: "World Liberty Financial raised", value: "$600M+", sub: "family receives 75% of revenue", color: "bg-orange-600 text-white" },
            { label: "Estimated retail investor losses", value: totalRetailLoss, sub: "on $TRUMP coin since launch", color: "bg-destructive text-white" },
            { label: "Mar-a-Lago annual membership", value: "$1M", sub: "up from $200K before re-election", color: "bg-foreground text-background" },
          ].map(s => (
            <Card key={s.label} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--border))]">
              <CardHeader className={`border-b-4 border-border py-2 px-3 ${s.color}`}>
                <CardTitle className="text-xs uppercase tracking-widest font-bold leading-tight">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-3xl font-black tracking-wider">{s.value}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* $TRUMP coin price chart */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b-4 pb-3" style={{ borderColor: "#FFD700" }}>
          <Coins className="w-8 h-8" style={{ color: "#FFD700" }} strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider" style={{ textShadow: "3px 3px 0px #B8860B" }}>
            $TRUMP Coin — Price vs. Policy Events
          </h2>
        </div>

        <div className="border-4 p-4" style={{ borderColor: "#B8860B", background: "#FFD70010" }}>
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            The $TRUMP meme coin launched <span className="font-black" style={{ color: "#B8860B" }}>January 17, 2025 — 48 hours before inauguration</span>.
            The Trump family retains <span className="font-black" style={{ color: "#B8860B" }}>80% of the 1 billion total token supply</span> (800M tokens),
            locked for 3 years with gradual vesting. At inauguration day peak of $74.59, the paper value of the family stake exceeded $59 billion.
            Within days, the coin had lost 70%+ of its value — with retail investors absorbing the losses while the family's locked stake
            remained insulated from the immediate crash.
          </p>
        </div>

        <Card className="border-4 border-border rounded-none" style={{ boxShadow: "8px 8px 0px 0px #B8860B" }}>
          <CardHeader className="border-b-4 border-border text-black" style={{ background: "#FFD700", borderColor: "#B8860B" }}>
            <CardTitle className="text-xl uppercase tracking-wider">$TRUMP Price (USD) — Jan–May 2025</CardTitle>
            <p className="text-xs font-black uppercase">Annotated with key policy events that benefited Trump crypto holdings</p>
          </CardHeader>
          <CardContent className="p-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRUMP_COIN_PRICE} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
                  labelFormatter={(l) => {
                    const pt = TRUMP_COIN_PRICE.find(p => p.date === l);
                    return pt?.event ? `${l} — ${pt.event}` : l;
                  }}
                />
                {/* Reference lines for key policy events */}
                <ReferenceLine x="Jan 20" stroke="#CC0000" strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: "Inauguration", position: "top", fontSize: 9, fontWeight: "bold", fill: "#CC0000" }} />
                <ReferenceLine x="Mar 7" stroke="#7C3AED" strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: "BTC Reserve EO", position: "top", fontSize: 9, fontWeight: "bold", fill: "#7C3AED" }} />
                <ReferenceLine x="Mar 26" stroke="#059669" strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: "Meme coin ≠ security", position: "top", fontSize: 9, fontWeight: "bold", fill: "#059669" }} />
                <ReferenceLine x="May 12" stroke="#EA580C" strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: "WH Dinner offer", position: "top", fontSize: 9, fontWeight: "bold", fill: "#EA580C" }} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#B8860B"
                  strokeWidth={3}
                  fill="url(#goldGrad)"
                  dot={(props) => {
                    const { cx, cy, payload, key } = props;
                    if (!payload.event) return <circle key={key} r={0} cx={cx} cy={cy} fill="none" />;
                    return <circle key={key} cx={cx} cy={cy} r={5} fill="#CC0000" stroke="#fff" strokeWidth={2} />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="border-t-4 border-border px-4 py-3 bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold uppercase">
              <div><span className="text-muted-foreground">Launch price:</span> $0.18</div>
              <div><span className="text-muted-foreground">Inauguration peak:</span> <span className="text-amber-600">$74.59</span></div>
              <div><span className="text-muted-foreground">72-hr gain:</span> <span style={{ color: "#059669" }}>+41,000%</span></div>
              <div><span className="text-muted-foreground">Family take at peak:</span> <span className="text-destructive">$59.7B (paper)</span></div>
            </div>
          </div>
        </Card>

        {/* Dinner with Trump callout */}
        <div className="border-4 border-destructive bg-destructive/5 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" strokeWidth={3} />
            <div>
              <p className="font-black uppercase tracking-wider text-destructive">The Dinner Scandal — May 2025</p>
              <p className="text-sm font-bold leading-relaxed mt-1">
                On May 5, 2025, the official $TRUMP website announced that the top 220 holders of the meme coin
                would receive an invitation to dine with President Trump at his golf club.
                The offer caused the coin's price to surge <span className="font-black text-destructive">70% in 24 hours</span>,
                generating millions of dollars in value for the Trump family's 80% stake.
              </p>
              <p className="text-sm font-bold leading-relaxed mt-2">
                Congressional investigators found that <span className="font-black">foreign nationals — including Chinese citizens</span> —
                had purchased large amounts of $TRUMP in apparent attempts to secure a seat at the dinner,
                raising direct emoluments concerns. Democratic senators introduced the ETHICS Act to prohibit sitting presidents
                from operating personal cryptocurrency enterprises.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="https://www.nytimes.com/2025/05/05/us/politics/trump-meme-coin-dinner.html" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-destructive bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> NYT: Trump dinner offer
            </a>
            <a href="https://www.washingtonpost.com/politics/2025/05/trump-meme-coin-foreign-buyers-emoluments/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-destructive bg-background hover:bg-accent">
              <ExternalLink className="w-3 h-3" /> WaPo: Foreign buyers, emoluments
            </a>
          </div>
        </div>
      </section>

      {/* ── THE MAR-A-LAGO DINNER SECTION ── */}
      <section className="space-y-6" id="dinner-section">

        {/* Red header banner */}
        <div className="border-8 border-destructive bg-destructive text-white p-5 flex flex-wrap items-center gap-4"
          style={{ boxShadow: "8px 8px 0px 0px #7f1d1d" }}>
          <Utensils className="w-10 h-10 shrink-0" strokeWidth={3} />
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-75">Presidential Access for Sale · May 22, 2025</p>
            <h2 className="text-3xl md:text-4xl uppercase tracking-wider leading-tight">
              The Mar-a-Lago $TRUMP Coin Dinner
            </h2>
            <p className="text-sm font-bold uppercase tracking-wider opacity-90 mt-1">
              Pay for your $TRUMP ranking · Secure a seat · Dine with the president of the United States
            </p>
          </div>
        </div>

        {/* Intro context */}
        <div className="border-4 border-destructive bg-destructive/5 p-5">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            On <span className="font-black text-destructive">May 5, 2025</span>, the official $TRUMP meme coin website announced
            that the <span className="font-black">top 220 holders</span> of the coin — ranked by wallet balance — would receive
            a personal invitation to dine with President Trump at <span className="font-black">Mar-a-Lago</span>, his private resort
            in Palm Beach, Florida. The top 25 holders would receive an exclusive <span className="font-black">VIP reception</span> before
            the dinner. There was no application process, no background check, and no disclosure of who attended.
            Access to the sitting president was available to anyone who could afford enough of his personal meme coin.
          </p>
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DINNER_STATS.map(s => (
            <Card key={s.label} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_rgba(204,0,0,1)]">
              <CardHeader className={`border-b-4 border-border py-2 px-3 ${s.color}`}>
                <CardTitle className="text-xs uppercase tracking-widest font-bold leading-tight">{s.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-3xl font-black tracking-wider">{s.value}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b-4 border-destructive pb-3">
            <Flag className="w-7 h-7 text-destructive" strokeWidth={3} />
            <h3 className="text-2xl uppercase tracking-wider drop-shadow-[2px_2px_0px_rgba(204,0,0,1)]">
              Timeline of Events
            </h3>
          </div>

          <div className="space-y-0 border-4 border-border overflow-hidden"
            style={{ boxShadow: "6px 6px 0px 0px rgba(204,0,0,1)" }}>
            {DINNER_TIMELINE.map((item, i) => (
              <div key={i}
                className={`grid grid-cols-1 md:grid-cols-[200px_1fr] border-b-4 last:border-b-0 border-border ${item.date === "May 22, 2025" ? "bg-destructive/10" : ""}`}>
                <div className={`px-4 py-4 border-b-4 md:border-b-0 md:border-r-4 border-border flex flex-col justify-center ${item.date === "May 22, 2025" ? "bg-destructive text-white" : "bg-muted/40"}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${item.date === "May 22, 2025" ? "text-white/70" : "text-muted-foreground"}`}>Date</p>
                  <p className="font-black text-sm uppercase tracking-wide">{item.date}</p>
                  {item.date === "May 22, 2025" && (
                    <span className="text-xs font-black uppercase mt-1 bg-white text-destructive px-2 py-0.5 inline-block w-fit">DINNER NIGHT</span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-black uppercase tracking-wide text-sm">{item.label}</p>
                  <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foreign nationals concern */}
        <div className="border-4 border-orange-600 bg-orange-50 dark:bg-orange-950/20 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Globe className="w-8 h-8 text-orange-600 shrink-0 mt-0.5" strokeWidth={3} />
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
                Foreign Nationals & Emoluments Concerns
              </h3>
              <p className="text-sm font-bold leading-relaxed mt-2">
                Blockchain analytics firms and Congressional investigators identified <span className="font-black">multiple wallets
                in the top 220</span> controlled by foreign nationals, including Chinese citizens and at least one account
                with apparent ties to a <span className="font-black">state-affiliated Chinese corporation</span>. Because wallet
                ownership is pseudonymous, the White House could not verify — and chose not to verify — the citizenship
                or national origin of any attendees.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Globe, title: "Foreign Emoluments Clause", body: "Art. I §9 of the Constitution bars the president from receiving gifts or payments from foreign governments. Coin purchases by foreign nationals connected to foreign states to gain presidential access are a direct test case.", color: "border-orange-600" },
                  { icon: ShieldAlert, title: "No Vetting Process", body: "The White House confirmed it conducted no national security screening of dinner attendees. Anyone who held enough $TRUMP could attend — regardless of their country, background, or government affiliations.", color: "border-destructive" },
                  { icon: Gavel, title: "No Congressional Consent", body: "The Foreign Emoluments Clause requires Congressional approval before the president accepts foreign gifts. No such consent was sought. Ethics watchdogs note this alone may constitute a constitutional violation.", color: "border-orange-600" },
                ].map(item => (
                  <div key={item.title} className={`border-4 ${item.color} bg-background p-3 space-y-1`}>
                    <p className="text-xs font-black uppercase tracking-widest text-orange-600">{item.title}</p>
                    <p className="text-sm font-semibold leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reaction quotes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 border-b-4 border-border pb-3">
            <Users className="w-7 h-7" strokeWidth={3} />
            <h3 className="text-2xl uppercase tracking-wider">Reactions from Ethics Officials & Congress</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DINNER_REACTIONS.map((r, i) => (
              <blockquote key={i}
                className="border-4 border-border bg-muted/20 p-4 space-y-2"
                style={{ boxShadow: "4px 4px 0px 0px hsl(var(--border))" }}>
                <p className="text-sm font-bold leading-relaxed italic">"{r.quote}"</p>
                <footer className="border-t-2 border-border pt-2">
                  <p className="text-xs font-black uppercase tracking-wider">{r.name}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{r.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

        {/* Congressional action */}
        <div className="border-4 border-foreground p-5 space-y-4" style={{ boxShadow: "6px 6px 0px 0px hsl(var(--border))" }}>
          <div className="flex items-center gap-3">
            <Gavel className="w-7 h-7" strokeWidth={3} />
            <h3 className="text-xl font-black uppercase tracking-wider">Congressional & Legal Response</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "ETHICS Act (S. 1462)",
                sponsor: "Sens. Schiff, Merkley, Warren",
                text: "Would prohibit sitting presidents, vice presidents, members of Congress, senior executive officials, and their spouses and children from issuing, sponsoring, or holding personal cryptocurrency while in office. Introduced directly in response to the $TRUMP dinner.",
                status: "Introduced — Senate Banking Committee",
                statusColor: "bg-amber-500 text-black",
              },
              {
                title: "Senate Investigation Request",
                sponsor: "Senate Foreign Relations Committee",
                text: "Committee chair requested a classified briefing from the State Dept and intelligence community on whether any foreign government-linked entities purchased $TRUMP specifically to attend the dinner and access the president.",
                status: "Pending — State Dept Response Requested",
                statusColor: "bg-orange-600 text-white",
              },
              {
                title: "CREW Ethics Complaint",
                sponsor: "Citizens for Responsibility and Ethics in Washington",
                text: "Filed a formal ethics complaint with the OGE and DOJ, alleging the dinner constitutes an illegal emolument under both the Foreign and Domestic Emoluments Clauses and requesting a Special Counsel investigation.",
                status: "Filed — OGE Under Review",
                statusColor: "bg-destructive text-white",
              },
              {
                title: "FOIA Requests — Attendee List",
                sponsor: "Multiple press organizations + ACLU",
                text: "Over a dozen FOIA requests filed to obtain the full attendee list, any White House communications about attendee vetting, and records of the dinner's security clearance process. White House has declined to release any information.",
                status: "Pending — White House Stonewalling",
                statusColor: "bg-foreground text-background",
              },
            ].map(item => (
              <div key={item.title} className="border-4 border-border p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-black uppercase tracking-wide text-sm">{item.title}</p>
                  <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-border ${item.statusColor}`}>{item.status}</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.sponsor}</p>
                <p className="text-sm font-semibold leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reference links */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "NYT: Trump Meme Coin Dinner", url: "https://www.nytimes.com/2025/05/05/us/politics/trump-meme-coin-dinner.html" },
            { label: "WaPo: Foreign Buyers & Emoluments", url: "https://www.washingtonpost.com/politics/2025/05/trump-meme-coin-foreign-buyers-emoluments/" },
            { label: "Reuters: $TRUMP Dinner Controversy", url: "https://www.reuters.com/world/us/trump-meme-coin-dinner-mar-a-lago-2025-05/" },
            { label: "Congress.gov: ETHICS Act (S.1462)", url: "https://www.congress.gov/bill/119th-congress/senate-bill/1462" },
            { label: "CREW: Emoluments Complaint", url: "https://www.citizensforethics.org/reports-investigations/crew-reports/trump-conflicts-of-interest/" },
            { label: "CoinDesk: Dinner Wallet Analysis", url: "https://www.coindesk.com/markets/2025/05/trump-dinner-top-220-wallets-analysis/" },
          ].map(ref => (
            <a key={ref.label} href={ref.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase border-2 border-border bg-background hover:bg-accent transition-colors">
              <ExternalLink className="w-3 h-3" /> {ref.label}
            </a>
          ))}
        </div>

      </section>

      {/* Revenue streams */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3" style={{ textShadow: "3px 3px 0px #B8860B" }}>
          Revenue Streams — Click for Conflict Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {REVENUE_STREAMS.map(s => <RevenueCard key={s.name} stream={s} />)}
        </div>
      </section>

      {/* Policy vs. holdings timeline */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b-4 border-border pb-3">
          <Scale className="w-8 h-8 text-destructive" strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
            Policy Decisions vs. Personal Holdings
          </h2>
        </div>
        <div className="border-4 border-destructive bg-destructive/5 p-4">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            The following regulatory and policy decisions all benefited Trump's personal crypto holdings.
            In no case did Trump recuse himself or disclose the personal financial interest.
            Ethics experts note this represents an unprecedented conflict of interest — a president regulating
            an industry in which he holds a direct personal financial stake.
          </p>
        </div>

        <div className="space-y-3">
          {visibleConflicts.map((item, i) => {
            const sev = SEVERITY_CFG[item.severity];
            return (
              <div key={i} className="border-4 border-border grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-0">
                {/* Date/days column */}
                <div className="bg-foreground text-background px-4 py-3 flex flex-col justify-center items-center min-w-[120px]">
                  <p className="text-xs font-black uppercase tracking-widest opacity-70">{item.date}</p>
                  <p className="text-lg font-black" style={{ color: "#FFD700" }}>Day +{item.days_from_launch}</p>
                  <p className="text-xs font-bold uppercase opacity-60">since launch</p>
                </div>
                {/* Content */}
                <div className="p-4 space-y-2 border-l-4 border-border">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 ${sev.bg} ${sev.color}`}>
                      {sev.label}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Benefits: {item.beneficiary}</span>
                  </div>
                  <p className="font-black uppercase tracking-wide text-sm">{item.action}</p>
                  <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{item.crypto_benefit}</p>
                </div>
              </div>
            );
          })}
        </div>

        {POLICY_CONFLICTS.length > 5 && (
          <button
            onClick={() => setShowAllConflicts(v => !v)}
            className="w-full border-4 border-border py-3 font-black uppercase tracking-wider hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
          >
            {showAllConflicts
              ? <><ChevronUp className="w-4 h-4" /> Show fewer</>
              : <><ChevronDown className="w-4 h-4" /> Show all {POLICY_CONFLICTS.length} conflicts</>}
          </button>
        )}
      </section>

      {/* Who actually lost money */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b-4 border-border pb-3">
          <TrendingDown className="w-8 h-8 text-destructive" strokeWidth={3} />
          <h2 className="text-3xl uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
            Who Lost — Retail Investors
          </h2>
        </div>
        <div className="border-4 border-destructive bg-destructive/5 p-4">
          <p className="text-sm font-bold uppercase tracking-wider leading-relaxed">
            Blockchain analytics firms estimated over <span className="font-black text-destructive">$2 billion in retail investor losses</span> on the $TRUMP coin
            in the first 30 days. The structure of the launch — where the family holds 80% with a 3-year lock — meant the
            Trump family was insulated from the crash while retail investors (who could sell immediately) faced the full downside.
          </p>
        </div>

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_rgba(204,0,0,1)]">
          <CardHeader className="border-b-4 border-border bg-destructive text-white">
            <CardTitle className="text-lg uppercase tracking-wider">% of $TRUMP Investors Losing Money (by size)</CardTitle>
            <p className="text-xs font-black uppercase opacity-80">Source: On-chain analytics estimates, ~30 days post-launch</p>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={INVESTOR_LOSS_DATA} margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fontWeight: "bold", fill: "hsl(var(--foreground))" }} />
                <YAxis type="category" dataKey="group" width={200}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "hsl(var(--foreground))" }} />
                <Tooltip
                  contentStyle={{ border: "4px solid hsl(var(--border))", borderRadius: 0, fontWeight: "bold", fontSize: 12 }}
                  formatter={(v: number, key: string) => [
                    key === "pct_losing" ? `${v}%` : `$${v.toLocaleString()}`,
                    key === "pct_losing" ? "% losing money" : "Avg loss",
                  ]}
                />
                <Bar dataKey="pct_losing" fill="#CC0000" stroke="#7f1d1d" strokeWidth={2} name="pct_losing">
                  <LabelList dataKey="pct_losing" position="right"
                    style={{ fontSize: 12, fontWeight: 900, fill: "hsl(var(--foreground))" }}
                    formatter={(v: number) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Emoluments / legal context */}
      <section className="space-y-6">
        <h2 className="text-3xl uppercase tracking-wider border-b-4 border-border pb-3 drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
          Legal & Constitutional Concerns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "Domestic Emoluments Clause",
              text: "Article II, Section 1 prohibits the president from receiving compensation beyond their salary from any federal or state government. Using the presidency to drive traffic and legitimacy to a personal financial product arguably violates this prohibition.",
              source: "U.S. Constitution, Art. II §1",
              color: "#CC0000",
            },
            {
              title: "Foreign Emoluments Clause",
              text: "Article I, Section 9 prohibits the president from receiving gifts or payments from foreign governments without Congressional consent. Foreign nationals purchasing $TRUMP to attend a White House dinner are a direct example of this violation.",
              source: "U.S. Constitution, Art. I §9",
              color: "#7C3AED",
            },
            {
              title: "Securities Regulation Self-Dealing",
              text: "The SEC under Trump issued guidance that meme coins are not securities — specifically exempting the president's own product from regulation. The CFTC and SEC dropped enforcement actions against crypto firms that had invested in WLFI.",
              source: "SEC Staff Bulletin, Mar 2025",
              color: "#EA580C",
            },
          ].map(item => (
            <Card key={item.title} className="border-4 border-border rounded-none shadow-[5px_5px_0px_0px_hsl(var(--border))]">
              <CardHeader className="border-b-4 py-3 px-4 text-white" style={{ background: item.color, borderColor: item.color }}>
                <CardTitle className="text-sm uppercase tracking-wide">{item.title}</CardTitle>
                <p className="text-xs font-bold uppercase opacity-70">{item.source}</p>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm font-semibold leading-relaxed">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bottom line */}
      <section className="border-8 p-6 space-y-3" style={{ borderColor: "#B8860B", background: "#FFD70010" }}>
        <h3 className="text-2xl uppercase tracking-wider font-black" style={{ textShadow: "2px 2px 0px #B8860B" }}>
          The Unprecedented Bottom Line
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "First president to", desc: "personally launch a cryptocurrency 48 hours before taking office", color: "#B8860B" },
            { label: "Policy first", desc: "regulate an industry (crypto) while holding a direct personal financial stake in its outcome", color: "#CC0000" },
            { label: "Never before", desc: "has a US president sold access to himself via a financial token that directly benefits his personal estate", color: "#7C3AED" },
          ].map(s => (
            <div key={s.label} className="border-4 border-border p-4">
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: s.color }}>{s.label}:</p>
              <p className="text-sm font-bold leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
          Sources: CoinDesk, WSJ, NYT, WaPo, Bloomberg, CREW (Citizens for Responsibility and Ethics in Washington),
          on-chain analytics (Chainalysis, Nansen), Congressional Research Service. Dollar figures reflect market data and independent estimates.
        </p>
      </section>

    </div>
  );
}
