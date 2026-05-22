import { useListActions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";
import { Search } from "lucide-react";

export default function ActionsPage() {
  const [search, setSearch] = useState("");
  const { data: actions, isLoading } = useListActions({ search: search || undefined });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b-8 border-border pb-6">
        <h1 className="text-6xl md:text-8xl tracking-wider uppercase text-foreground mb-4 drop-shadow-[4px_4px_0px_rgba(204,0,0,1)]">
          Administration Actions
        </h1>
        <p className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
          Filter and search the definitive record
        </p>
      </header>

      <div className="flex gap-4 items-center mb-8 relative">
        <Search className="w-6 h-6 absolute left-4 text-muted-foreground" />
        <Input 
          placeholder="Search actions..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 text-lg border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--primary))] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions?.map(action => (
            <Card key={action.id} className="border-4 border-border rounded-none shadow-[4px_4px_0px_0px_hsl(var(--border))] hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))] transition-all flex flex-col">
              <CardHeader className="border-b-4 border-border bg-accent">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-2xl font-black uppercase tracking-wider">{action.title}</CardTitle>
                  <Badge variant={action.status === 'enacted' ? 'default' : 'destructive'} className="border-2 border-border rounded-none font-bold uppercase tracking-wider text-sm px-3 py-1">
                    {action.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1">
                <p className="text-lg font-medium text-muted-foreground line-clamp-3 mb-4">{action.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <Badge variant="outline" className="border-2 border-border rounded-none font-bold uppercase">{action.category.replace(/_/g, ' ')}</Badge>
                  {action.supremeCourtChallenged && (
                    <Badge variant="destructive" className="border-2 border-border rounded-none font-bold uppercase">SCOTUS Challenged</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 border-t-4 border-border bg-muted/50 mt-auto flex justify-between items-center">
                <span className="font-bold text-muted-foreground">{new Date(action.date).toLocaleDateString()}</span>
                <Link href={`/actions/${action.id}`} className="font-bold uppercase tracking-wider bg-foreground text-background px-6 py-2 border-2 border-border hover:bg-primary hover:text-primary-foreground transition-colors">
                  Read Full Report
                </Link>
              </CardFooter>
            </Card>
          ))}
          {actions?.length === 0 && (
            <div className="col-span-full p-12 text-center border-4 border-border bg-muted/50">
              <h2 className="text-4xl font-display text-muted-foreground">No Actions Found</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
