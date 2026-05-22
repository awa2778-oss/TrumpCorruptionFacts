import { useGetActionStats, useGetSupremeCourtStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
