import { useGetSupremeCourtStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function SupremeCourtComparePage() {
  const { data: stats, isLoading } = useGetSupremeCourtStats();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b-8 border-border pb-6">
        <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground mb-4 drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
          SCOTUS Comparison
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Historical win/loss records across administrations
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats?.slice(0, 4).map(stat => (
              <Card key={stat.administration} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
                <CardHeader className="bg-secondary text-secondary-foreground border-b-4 border-border p-4">
                  <CardTitle className="text-xl uppercase tracking-wider">{stat.president}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-card">
                  <div className="text-4xl font-display mb-2 text-center">{stat.winRate.toFixed(1)}% Win Rate</div>
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider mt-4">
                    <span className="text-green-600 dark:text-green-400">{stat.won} Won</span>
                    <span className="text-destructive">{stat.lost} Lost</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
            <CardHeader className="border-b-4 border-border bg-accent">
              <CardTitle className="text-3xl uppercase tracking-wider">Win vs Loss by Administration</CardTitle>
            </CardHeader>
            <CardContent className="p-8 h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="president" 
                    tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: 14, fill: 'hsl(var(--foreground))' }} 
                    angle={-45} 
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))'}} 
                    contentStyle={{ border: '4px solid hsl(var(--border))', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} 
                  />
                  <Legend wrapperStyle={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '20px' }} />
                  <Bar dataKey="won" stackId="a" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={3} name="Won" />
                  <Bar dataKey="lost" stackId="a" fill="hsl(var(--destructive))" stroke="hsl(var(--border))" strokeWidth={3} name="Lost" />
                  <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted-foreground))" stroke="hsl(var(--border))" strokeWidth={3} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
