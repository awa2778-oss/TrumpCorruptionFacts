import { useGetActionStats, useGetSupremeCourtStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

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
    </div>
  );
}
