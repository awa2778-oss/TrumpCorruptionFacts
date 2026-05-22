import { useListSupremeCourtCases } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

export default function SupremeCourtPage() {
  const { data: cases, isLoading } = useListSupremeCourtCases();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b-8 border-border pb-6">
        <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground mb-4 drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
          Supreme Court Cases
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Administration battles at the highest court
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {cases?.map(scCase => (
            <Card key={scCase.id} className="border-4 border-border rounded-none shadow-[8px_8px_0px_0px_hsl(var(--foreground))] flex flex-col md:flex-row">
              <div className="md:w-1/3 border-b-4 md:border-b-0 md:border-r-4 border-border bg-secondary text-secondary-foreground p-8 flex flex-col justify-center">
                <Badge 
                  variant={scCase.outcome === 'administration_won' ? 'default' : scCase.outcome === 'administration_lost' ? 'destructive' : 'outline'} 
                  className={`border-2 mb-4 w-fit rounded-none font-bold uppercase tracking-wider text-sm px-3 py-1 ${scCase.outcome === 'pending' || scCase.outcome === 'partial' ? 'border-secondary-foreground text-secondary-foreground' : 'border-border'}`}
                >
                  {scCase.outcome.replace(/_/g, ' ')}
                </Badge>
                <CardTitle className="text-3xl font-black uppercase tracking-wider leading-tight mb-2">{scCase.title}</CardTitle>
                <p className="text-xl font-bold opacity-80">{scCase.year}</p>
              </div>
              <div className="md:w-2/3 flex flex-col">
                <CardContent className="p-8 flex-1">
                  <p className="text-xl font-serif leading-relaxed mb-6">{scCase.description}</p>
                  <div className="bg-muted p-4 border-2 border-border border-dashed">
                    <p className="font-bold uppercase text-sm tracking-wider text-muted-foreground mb-1">Significance</p>
                    <p className="font-medium">{scCase.significance}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-6 border-t-4 border-border bg-accent/50 flex flex-wrap gap-4 items-center justify-between">
                  <Badge variant="outline" className="border-2 border-border rounded-none font-bold uppercase text-foreground bg-background">
                    {scCase.category.replace(/_/g, ' ')}
                  </Badge>
                  {scCase.references && scCase.references.length > 0 && (
                    <div className="flex flex-col items-end">
                      {scCase.references.map((ref, idx) => (
                        <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold uppercase tracking-wider hover:text-primary transition-colors text-sm">
                          {ref.source} <ExternalLink className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  )}
                </CardFooter>
              </div>
            </Card>
          ))}
          {cases?.length === 0 && (
            <div className="p-12 text-center border-4 border-border bg-muted/50">
              <h2 className="text-4xl font-display text-muted-foreground">No Cases Found</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
