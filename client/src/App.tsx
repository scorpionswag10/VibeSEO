import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ProjectDetails from "@/pages/project-details";
import SettingsPage from "@/pages/settings";
import CompetitorResearch from "@/pages/competitor-research";
import ContentIdeas from "@/pages/content-ideas";
import GlobalPulse from "@/pages/global-pulse";
import { LayoutShell } from "@/components/layout-shell";

function Router() {
  return (
    <LayoutShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard/global-pulse" component={GlobalPulse} />
        <Route path="/projects/:id" component={ProjectDetails} />
        <Route path="/competitor-research" component={CompetitorResearch} />
        <Route path="/content-ideas" component={ContentIdeas} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </LayoutShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
