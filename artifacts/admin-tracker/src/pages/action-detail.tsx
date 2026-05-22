import { useGetAction } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ActionDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: action, isLoading } = useGetAction(id, {
    query: { enabled: !!id, queryKey: ['/api/actions', id] } // Using a basic string key to avoid import issues if getGetActionQueryKey isn't exported as expected
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!action) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-4xl font-display uppercase tracking-widest text-destructive">Action Not Found</h1>
        <Link href="/actions" className="text-primary font-bold mt-4 inline-block uppercase">Return to Actions</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/actions" className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8 transition-colors border-2 border-transparent hover:border-border px-4 py-2 hover:bg-accent">
        <ArrowLeft className="w-5 h-5" /> Back to Actions
      </Link>

      <article className="border-4 border-border bg-card shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
        <header className="p-8 md:p-12 border-b-4 border-border bg-secondary text-secondary-foreground">
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant={action.status === 'enacted' ? 'default' : 'destructive'} className="border-2 border-border rounded-none font-bold uppercase tracking-wider text-lg px-4 py-1">
              {action.status}
            </Badge>
            <Badge variant="outline" className="border-2 border-secondary-foreground rounded-none font-bold uppercase tracking-wider text-lg px-4 py-1 text-secondary-foreground">
              {action.category.replace(/_/g, ' ')}
            </Badge>
            {action.supremeCourtChallenged && (
              <Badge variant="destructive" className="border-2 border-border rounded-none font-bold uppercase tracking-wider text-lg px-4 py-1">
                SCOTUS Challenged
              </Badge>
            )}
          </div>
          
          <h1 className="text-5xl md:text-7xl tracking-wider uppercase mb-6 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
            {action.title}
          </h1>
          
          <div className="flex gap-6 text-xl font-bold uppercase tracking-wider opacity-80">
            <span>Date: {new Date(action.date).toLocaleDateString()}</span>
            <span>Admin: {action.administration.replace(/_/g, ' ')}</span>
          </div>
        </header>

        <div className="p-8 md:p-12 space-y-12">
          <section>
            <h2 className="text-3xl font-display uppercase tracking-widest border-b-4 border-border pb-2 mb-6">Description</h2>
            <p className="text-xl leading-relaxed font-serif">{action.description}</p>
          </section>

          {action.significance && (
            <section className="bg-muted p-8 border-4 border-border">
              <h2 className="text-3xl font-display uppercase tracking-widest mb-4">Significance</h2>
              <p className="text-lg font-medium">{action.significance}</p>
            </section>
          )}

          {action.references && action.references.length > 0 && (
            <section>
              <h2 className="text-3xl font-display uppercase tracking-widest border-b-4 border-border pb-2 mb-6">References & Receipts</h2>
              <ul className="space-y-4">
                {action.references.map((ref, idx) => (
                  <li key={idx} className="border-2 border-border p-4 hover:bg-accent transition-colors">
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-lg group-hover:underline">{ref.title}</p>
                        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{ref.source}</p>
                      </div>
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
