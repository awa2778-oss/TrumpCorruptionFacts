import { useGetActionStats, useGetSupremeCourtStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "wouter";
import { ExternalLink, ShieldCheck } from "lucide-react";

const CABINET_MEMBERS = [
  {
    name: "Pete Hegseth",
    title: "Secretary of Defense",
    loyaltyScore: 98,
    badge: "Unconditional",
    badgeColor: "#CC0000",
    evidence: [
      "Sexual assault allegation settled privately (2017)",
      "Excessive alcohol use reported by Fox News colleagues",
      "Mismanaged $6.3M at Concerned Veterans for America",
      "Leaked classified Houthi strike plans via Signal group chat",
      "Fired senior Pentagon officials who raised concerns",
    ],
    loyaltyAct: "Defended every scandal publicly. Purged military brass who questioned him. Zero accountability.",
    quote: "I'll do whatever it takes to serve President Trump's vision for the military.",
  },
  {
    name: "Kash Patel",
    title: "FBI Director",
    loyaltyScore: 99,
    badge: "True Believer",
    badgeColor: "#CC0000",
    evidence: [
      "No law enforcement or intelligence leadership experience",
      "Publicly named journalists and officials he intended to 'come after'",
      "Authored a children's book portraying Trump critics as villains",
      "Moved FBI headquarters — reportedly at Trump's personal request",
      "Directed FBI resources toward political adversaries",
    ],
    loyaltyAct: "Weaponized the FBI as a political instrument. Treated loyalty to Trump as the primary qualification.",
    quote: "We will come after the people in the media who lied about Donald Trump.",
  },
  {
    name: "Tulsi Gabbard",
    title: "Director of National Intelligence",
    loyaltyScore: 95,
    badge: "Strategic Convert",
    badgeColor: "#EA580C",
    evidence: [
      "Met with Syrian dictator Bashar al-Assad without Congressional notice",
      "Appeared on Russian state media and amplified Kremlin talking points",
      "Fired career intelligence officials who contradicted Trump's preferred narratives",
      "Shared intelligence assessments selectively to support political goals",
      "Said nothing publicly about $TRUMP coin foreign buyer emoluments concerns",
    ],
    loyaltyAct: "Purged the intelligence community of independent voices. Aligned assessments with political outcomes.",
    quote: "I serve at the pleasure of the president.",
  },
  {
    name: "Marco Rubio",
    title: "Secretary of State + Acting NSC Chair",
    loyaltyScore: 90,
    badge: "Former Critic",
    badgeColor: "#7C3AED",
    evidence: [
      "Called Trump 'a con artist' and 'the most vulgar person ever nominated' in 2016",
      "Took on unprecedented dual role (State Dept + NSC) — no historical precedent",
      "Defended tariff policies that damaged relations with NATO allies",
      "Stayed silent on $TRUMP coin dinner foreign nationals controversy",
      "Oversaw diplomatic reversals on Ukraine aid without Congressional input",
    ],
    loyaltyAct: "Reversed every prior criticism. Consolidated more foreign policy power than any Secretary of State in decades.",
    quote: "President Trump is the greatest president of my lifetime.",
  },
  {
    name: "Robert F. Kennedy Jr.",
    title: "Secretary of Health & Human Services",
    loyaltyScore: 88,
    badge: "Ideological Ally",
    badgeColor: "#059669",
    evidence: [
      "Spread vaccine misinformation for over a decade, causing measles resurgence",
      "Revealed a parasitic worm ate part of his brain — disclosed during HHS leadership",
      "Dismantled CDC vaccine advisory committees (ACIP)",
      "Cut $11B+ from NIH and CDC budgets, eliminating research programs",
      "Conflicts of interest with anti-vaccine advocacy groups he previously led",
    ],
    loyaltyAct: "Dismantled public health infrastructure that took decades to build. No dissent from broader DOGE cuts.",
    quote: "We're going to make America healthy again — the way the president wants.",
  },
  {
    name: "Russell Vought",
    title: "OMB Director",
    loyaltyScore: 97,
    badge: "Project 2025 Architect",
    badgeColor: "#1A1A1A",
    evidence: [
      "Authored key chapters of Project 2025 calling to dismantle the 'administrative state'",
      "Executed mass firing of career federal employees protected by civil service law",
      "Oversaw DOGE budget cuts without Congressional appropriation authority",
      "Impounded congressionally-approved funds — potentially unconstitutional",
      "Eliminated inspector general offices that provide independent oversight",
    ],
    loyaltyAct: "The operational brain of the anti-government agenda. Has more power over federal spending than any OMB director in history.",
    quote: "We want the administrative state to be hollowed out from the inside.",
  },
];

const NOTABLE_SILENCES = [
  { event: "$TRUMP Coin Dinner — Foreign Nationals Buying Presidential Access", date: "May 22, 2025", resignations: 0 },
  { event: "Signal Chat — Classified Military Strike Plans Leaked to Journalist", date: "March 2025", resignations: 0 },
  { event: "DOGE Mass Firings — 200,000+ Federal Workers Without Congressional Approval", date: "Feb–Apr 2025", resignations: 0 },
  { event: "Jan 6 Pardons — 1,500+ Rioters Including Violent Offenders Released", date: "Jan 20, 2025", resignations: 0 },
  { event: "Withdrawal from WHO, Paris Agreement & NATO Funding Threats", date: "Jan–Feb 2025", resignations: 0 },
  { event: "Elimination of Inspector General Offices Across 17 Agencies", date: "Jan 2025", resignations: 0 },
];

const WEALTH_STREAMS = [
  { label: "$TRUMP Coin — Family Stake (Current)", value: "~$10.5B", note: "800M tokens × ~$13/token", color: "#FFD700", textColor: "#000" },
  { label: "$TRUMP Coin — Peak Paper Value", value: "~$59.7B", note: "800M tokens × $74.59 peak (Jan 20)", color: "#B8860B", textColor: "#fff" },
  { label: "World Liberty Financial (WLFI)", value: "~$450M+", note: "75% of $600M+ raised in token sales", color: "#EA580C", textColor: "#fff" },
  { label: "Digital NFT Trading Cards", value: "~$100M+", note: "4 series × $99/card, ~250K cards", color: "#7C3AED", textColor: "#fff" },
  { label: "Mar-a-Lago Memberships", value: "~$75M+", note: "$1M/yr × ~75 new members post-re-election", color: "#059669", textColor: "#fff" },
  { label: "Saudi / LIV Golf Deals", value: "Undisclosed", note: "LIV tournaments at Trump courses; $600B Saudi pledge", color: "#374151", textColor: "#fff" },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetActionStats();
  const { data: scStats, isLoading: scLoading } = useGetSupremeCourtStats();

  if (statsLoading || scLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-16 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── WEALTH BANNER ── */}
      <div className="border-8 border-black overflow-hidden" style={{ boxShadow: "10px 10px 0px 0px #B8860B" }}>

        {/* Header strip */}
        <div className="bg-black text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-60">Estimated Presidential Profits</p>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider" style={{ color: "#FFD700" }}>
                Trump Wealth Accumulated Since Taking Office
              </h2>
            </div>
          </div>
          <Link href="/enrichment"
            className="inline-flex items-center gap-1 px-3 py-2 border-2 text-xs font-black uppercase tracking-wider hover:opacity-80 transition-opacity shrink-0"
            style={{ borderColor: "#FFD700", color: "#FFD700" }}>
            <ExternalLink className="w-3 h-3" /> Full Breakdown
          </Link>
        </div>

        {/* Big total */}
        <div className="bg-destructive text-white px-6 py-5 flex flex-wrap items-end gap-6 border-b-4 border-black">
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-75">Total Estimated — Current Value</p>
            <p className="text-5xl md:text-7xl font-black tracking-wider" style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}>
              ~$11.1B+
            </p>
            <p className="text-xs font-bold uppercase opacity-75 mt-1">Crypto + DeFi + NFTs + Mar-a-Lago memberships</p>
          </div>
          <div className="border-l-4 border-white/30 pl-6">
            <p className="text-xs font-black uppercase tracking-widest opacity-75">Peak Paper Value (Jan 20, 2025)</p>
            <p className="text-4xl md:text-5xl font-black tracking-wider opacity-90" style={{ textShadow: "3px 3px 0px rgba(0,0,0,0.4)" }}>
              ~$60.3B+
            </p>
            <p className="text-xs font-bold uppercase opacity-60 mt-1">Inauguration Day $TRUMP all-time high</p>
          </div>
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {WEALTH_STREAMS.map((s, i) => (
            <div key={i}
              className="border-r-4 last:border-r-0 border-black p-4 flex flex-col gap-1"
              style={{ background: s.color }}>
              <p className="text-xs font-black uppercase tracking-widest leading-tight" style={{ color: s.textColor, opacity: 0.7 }}>
                {s.label}
              </p>
              <p className="text-2xl font-black tracking-wide" style={{ color: s.textColor }}>
                {s.value}
              </p>
              <p className="text-xs font-bold leading-tight" style={{ color: s.textColor, opacity: 0.7 }}>
                {s.note}
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer strip */}
        <div className="bg-muted/80 border-t-4 border-black px-5 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sources: CoinDesk, WSJ, NYT, Bloomberg, CREW · Figures are estimates based on public market data and independent analysis · Not financial advice
          </p>
          <p className="text-xs font-black uppercase tracking-wider text-destructive">
            No president in U.S. history has accumulated personal wealth from office at this scale
          </p>
        </div>
      </div>

      <header className="mb-12 border-b-8 border-border pb-6">
        <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground mb-4 drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
          The Tracker
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Unflinching data on administration actions
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--primary))]">
          <CardHeader className="bg-primary border-b-4 border-border">
            <CardTitle className="text-2xl uppercase tracking-wider text-primary-foreground">Total Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-7xl font-display text-center" data-testid="stat-total-actions">{stats?.totalActions || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--destructive))]">
          <CardHeader className="bg-destructive border-b-4 border-border">
            <CardTitle className="text-2xl uppercase tracking-wider text-destructive-foreground">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-7xl font-display text-center">{stats?.byCategory.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-border rounded-none shadow-[6px_6px_0px_0px_hsl(var(--foreground))]">
          <CardHeader className="bg-foreground border-b-4 border-border">
            <CardTitle className="text-2xl uppercase tracking-wider text-background">SCOTUS Cases</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-7xl font-display text-center text-background">{scStats?.reduce((acc, curr) => acc + curr.totalCases, 0) || 0}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-4 border-border rounded-none">
          <CardHeader className="border-b-4 border-border bg-accent">
            <CardTitle className="text-2xl uppercase tracking-wider">Actions by Category</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byCategory} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                  angle={-45} 
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(val) => val.replace(/_/g, ' ').toUpperCase()}
                />
                <YAxis tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))'}} 
                  contentStyle={{ border: '4px solid hsl(var(--border))', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={3} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-4 border-border rounded-none">
          <CardHeader className="border-b-4 border-border bg-secondary text-secondary-foreground">
            <CardTitle className="text-2xl uppercase tracking-wider">SCOTUS Win Rates</CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="administration" 
                  tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: 12, fill: 'hsl(var(--foreground))' }}
                  tickFormatter={(val) => val.replace(/_/g, ' ').toUpperCase()}
                />
                <YAxis tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--muted))'}} 
                  contentStyle={{ border: '4px solid hsl(var(--border))', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} 
                />
                <Bar dataKey="winRate" fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={3} name="Win Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* ── CABINET LOYALTY WALL ── */}
      <section className="space-y-6">

        {/* Section header */}
        <div className="border-b-8 border-border pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
              Despite Overwhelming Evidence
            </p>
            <h2 className="text-4xl md:text-5xl font-display uppercase tracking-wider drop-shadow-[3px_3px_0px_rgba(204,0,0,1)]">
              The Loyalty Wall
            </h2>
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mt-2 max-w-2xl">
              Every cabinet member confirmed. Zero resignations over corruption, classified leaks, or constitutional violations.
              A historic consolidation of unconditional loyalty at the highest levels of government.
            </p>
          </div>
          <div className="border-4 border-destructive bg-destructive text-white px-5 py-3 text-center shrink-0">
            <p className="text-xs font-black uppercase tracking-widest opacity-75">Resignations Over Corruption</p>
            <p className="text-6xl font-black">0</p>
            <p className="text-xs font-black uppercase tracking-widest opacity-75">as of May 2025</p>
          </div>
        </div>

        {/* Cabinet cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CABINET_MEMBERS.map((m, i) => (
            <div key={i} className="border-4 border-border flex flex-col" style={{ boxShadow: `6px 6px 0px 0px ${m.badgeColor}` }}>

              {/* Card header */}
              <div className="border-b-4 border-border px-5 py-3 flex items-start justify-between gap-3"
                style={{ background: m.badgeColor }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white opacity-75">{m.title}</p>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white">{m.name}</h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-black uppercase text-white opacity-75">Loyalty</p>
                  <p className="text-3xl font-black text-white">{m.loyaltyScore}%</p>
                </div>
              </div>

              {/* Badge */}
              <div className="px-5 pt-3 pb-1">
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest px-2 py-1 border-2"
                  style={{ borderColor: m.badgeColor, color: m.badgeColor }}>
                  <ShieldCheck className="w-3 h-3" /> {m.badge}
                </span>
              </div>

              {/* Evidence list */}
              <div className="px-5 py-3 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-destructive mb-2">Evidence Ignored:</p>
                <ul className="space-y-1">
                  {m.evidence.map((e, j) => (
                    <li key={j} className="text-xs font-bold flex gap-2 leading-tight">
                      <span className="text-destructive shrink-0 mt-0.5">▸</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Loyalty act */}
              <div className="border-t-4 border-border bg-muted/60 px-5 py-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Loyalty Act:</p>
                <p className="text-xs font-bold leading-snug">{m.loyaltyAct}</p>
              </div>

              {/* Quote */}
              <div className="border-t-4 border-border bg-foreground px-5 py-3">
                <p className="text-xs font-bold italic text-background opacity-80">"{m.quote}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notable Silences table */}
        <div className="border-4 border-border" style={{ boxShadow: "6px 6px 0px 0px #CC0000" }}>
          <div className="bg-foreground text-background border-b-4 border-border px-6 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-60">The Record of Complicity</p>
              <h3 className="text-xl font-black uppercase tracking-wider">Notable Silences — No Resignations</h3>
            </div>
            <span className="text-3xl font-black" style={{ color: "#FFD700" }}>0 / {NOTABLE_SILENCES.length}</span>
          </div>
          <div className="divide-y-4 divide-border">
            {NOTABLE_SILENCES.map((s, i) => (
              <div key={i} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-destructive font-black text-lg shrink-0">✗</span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide">{s.event}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.date}</p>
                  </div>
                </div>
                <div className="border-2 border-destructive px-3 py-1 shrink-0">
                  <p className="text-xs font-black uppercase text-destructive">{s.resignations} Resignations</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-destructive/10 border-t-4 border-border px-6 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-destructive">
              Historical note: During Watergate, multiple cabinet members and senior officials resigned rather than carry out Nixon's orders.
              This cabinet has set a new standard for unconditional loyalty.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
