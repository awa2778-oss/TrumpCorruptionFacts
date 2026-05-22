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
