import { useCompareAdministrations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ComparePage() {
  const { data: comparison, isLoading } = useCompareAdministrations();

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <header className="mb-8 border-b-8 border-border pb-6">
        <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground mb-4 drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
          Administration Compare
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Executive action by the numbers
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
              <CardHeader className="border-b-4 border-border bg-secondary text-secondary-foreground">
                <CardTitle className="text-2xl uppercase tracking-wider">Executive Orders per Year</CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparison?.executiveOrdersTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="president" 
                      tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                      angle={-45} 
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}} 
                      contentStyle={{ border: '4px solid hsl(var(--border))', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} 
                    />
                    <Bar dataKey="perYear" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={3} name="Exec Orders / Year" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--destructive))]">
              <CardHeader className="border-b-4 border-border bg-destructive text-destructive-foreground">
                <CardTitle className="text-2xl uppercase tracking-wider">SCOTUS Cases vs Wins</CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparison?.administrations} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="president" 
                      tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fontSize: 12, fill: 'hsl(var(--foreground))' }} 
                      angle={-45} 
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}} 
                      contentStyle={{ border: '4px solid hsl(var(--border))', borderRadius: 0, fontWeight: 'bold', textTransform: 'uppercase' }} 
                    />
                    <Legend wrapperStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }} />
                    <Bar dataKey="supremeCourtCases" fill="hsl(var(--foreground))" stroke="hsl(var(--border))" strokeWidth={3} name="Total Cases" />
                    <Bar dataKey="supremeCourtWins" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={3} name="Wins" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </section>

          <Card className="border-4 border-border rounded-none overflow-hidden">
            <CardHeader className="bg-foreground text-background border-b-4 border-border">
              <CardTitle className="text-3xl uppercase tracking-wider">Raw Data</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-muted">
                  <TableRow className="border-b-4 border-border hover:bg-muted">
                    <TableHead className="font-display text-xl uppercase text-foreground py-4">Administration</TableHead>
                    <TableHead className="font-display text-xl uppercase text-foreground py-4">Party</TableHead>
                    <TableHead className="font-display text-xl uppercase text-foreground py-4 text-right">Years</TableHead>
                    <TableHead className="font-display text-xl uppercase text-foreground py-4 text-right">Exec Orders</TableHead>
                    <TableHead className="font-display text-xl uppercase text-foreground py-4 text-right">Legislation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison?.administrations.map((admin) => (
                    <TableRow key={admin.id} className="border-b-2 border-border hover:bg-accent transition-colors">
                      <TableCell className="font-bold text-lg py-4">{admin.president}</TableCell>
                      <TableCell className="font-bold uppercase tracking-wider py-4">
                        <span className={`px-2 py-1 border-2 border-border ${admin.party === 'Republican' ? 'bg-destructive text-destructive-foreground' : 'bg-blue-600 text-white'}`}>
                          {admin.party}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold py-4">{admin.startYear} - {admin.endYear || 'Present'}</TableCell>
                      <TableCell className="text-right font-display text-2xl py-4">{admin.executiveOrders}</TableCell>
                      <TableCell className="text-right font-display text-2xl py-4">{admin.legislationSigned}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
