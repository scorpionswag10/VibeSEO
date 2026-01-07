import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, TrendingUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GlobalPulse() {
  const { data: projects } = useProjects();
  
  // Calculate average Global Pulse Score (1-100)
  const calculatePulseScore = () => {
    if (!projects || projects.length === 0) return 0;
    // Mock logic: Inverse of average rank across regions
    return 78; // Example high-end tool value
  };

  const pulseScore = calculatePulseScore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-sans font-bold text-foreground mb-1">Global Pulse</h1>
        <p className="text-secondary">Real-time international ranking performance across Google regions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2 bg-card border-border shadow-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#1877F2]"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-secondary uppercase tracking-wider">Global Pulse Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-muted/30 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-[#1877F2] stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * pulseScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-foreground">{pulseScore}</span>
                <span className="text-sm font-bold text-[#1877F2] tracking-widest uppercase">Stable</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+2.4% vs last week</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="w-32 h-32 text-[#1877F2]" />
          </div>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-secondary uppercase tracking-wider">Top Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">United States</span>
              <span className="text-2xl">🇺🇸</span>
            </div>
            <p className="text-xs text-secondary mt-2">Avg. Rank: #12.4</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-secondary uppercase tracking-wider">Weakest Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">Australia</span>
              <span className="text-2xl">🇦🇺</span>
            </div>
            <p className="text-xs text-secondary mt-2">Avg. Rank: #42.1</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Global Performance</CardTitle>
            <p className="text-sm text-secondary">Keyword rankings across target countries</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg">
            <Search className="w-4 h-4 text-secondary" />
            <input type="text" placeholder="Filter keywords..." className="bg-transparent border-none text-xs focus:ring-0 text-foreground w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-secondary font-bold pl-6">Keyword</TableHead>
                <TableHead className="text-center text-secondary font-bold">US 🇺🇸</TableHead>
                <TableHead className="text-center text-secondary font-bold">UK 🇬🇧</TableHead>
                <TableHead className="text-center text-secondary font-bold">CA 🇨🇦</TableHead>
                <TableHead className="text-center text-secondary font-bold">AU 🇦🇺</TableHead>
                <TableHead className="text-right pr-6 text-secondary font-bold">Avg. Diff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.flatMap(p => p.keywords || []).map((kw: any) => {
                const latest = kw.history?.[kw.history.length - 1]?.googleRanks || { us: 0, uk: 0, ca: 0, au: 0 };
                return (
                  <TableRow key={kw.id} className="border-border hover:bg-muted/50 transition-colors group">
                    <TableCell className="font-bold text-foreground pl-6">{kw.term}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold",
                        latest.us <= 3 ? "bg-green-600/20 text-green-700 dark:text-green-400" : "bg-muted text-secondary"
                      )}>
                        {latest.us || "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold bg-muted text-secondary">
                        {latest.uk || "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold bg-muted text-secondary">
                        {latest.ca || "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold bg-muted text-secondary">
                        {latest.au || "--"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="text-xs text-green-600 dark:text-green-500 font-bold group-hover:underline cursor-help">
                        +4.2%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
