import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RootLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ActionsPage from "@/pages/actions";
import ActionDetailPage from "@/pages/action-detail";
import SupremeCourtPage from "@/pages/supreme-court";
import SupremeCourtComparePage from "@/pages/supreme-court-compare";
import ComparePage from "@/pages/compare";
import OverreachPage from "@/pages/overreach";
import ExecutiveOrdersPage from "@/pages/executive-orders";
import RetributionPage from "@/pages/retribution";
import BigBillPage from "@/pages/big-bill";
import EnrichmentPage from "@/pages/enrichment";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/actions" component={ActionsPage} />
      <Route path="/actions/:id" component={ActionDetailPage} />
      <Route path="/supreme-court" component={SupremeCourtPage} />
      <Route path="/supreme-court/compare" component={SupremeCourtComparePage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/overreach" component={OverreachPage} />
      <Route path="/executive-orders" component={ExecutiveOrdersPage} />
      <Route path="/retribution" component={RetributionPage} />
      <Route path="/big-bill" component={BigBillPage} />
      <Route path="/enrichment" component={EnrichmentPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RootLayout>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-background selection:bg-primary selection:text-primary-foreground">
                  <Router />
                </main>
              </div>
            </SidebarProvider>
          </WouterRouter>
        </RootLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
