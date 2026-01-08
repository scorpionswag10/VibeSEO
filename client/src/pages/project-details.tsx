import { normalizeUrl } from "@/lib/normalize";
import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useProject, useDeleteProject } from "@/hooks/use-projects";
import { useKeywords, useCreateKeyword, useDeleteKeyword } from "@/hooks/use-keywords";
import { useCompetitors, useCreateCompetitor } from "@/hooks/use-competitors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Trash2, 
  Plus, 
  LayoutList, 
  ShieldAlert, 
  TrendingUp,
  Loader2,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertKeywordSchema, type InsertKeyword, insertCompetitorSchema, type InsertCompetitor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { KeywordRankChart } from "@/components/keyword-rank-chart";

export default function ProjectDetails() {
  const { toast } = useToast();
  const [match, params] = useRoute("/projects/:id");
  const projectId = params ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("keywords");

  if (projectLoading || !projectId) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => setLocation("/"),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-white">{project.name}</h1>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-xs font-normal">Active</Badge>
            </div>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-white hover:underline flex items-center gap-1 mt-1">
              {project.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => {
              apiRequest("POST", "/api/send-weekly-report").then(() => {
                toast({ title: "Report Sent", description: "Weekly PDF report has been emailed." });
              });
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Weekly Report
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete 
                  <span className="font-bold text-white"> {project.name} </span>
                  and all associated keywords and rank history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10 bg-transparent hover:bg-white/5">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="keywords" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Keywords</TabsTrigger>
          <TabsTrigger value="competitors" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Competitors</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white px-6">Settings</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="keywords" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <KeywordsTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="competitors" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <CompetitorsTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="settings" className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="bg-card border border-white/5 rounded-2xl p-8 max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Project Settings</h3>
              <p className="text-muted-foreground mb-6">Configuration options specific to {project.name}.</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                   <div>
                     <p className="font-medium text-white">Daily Refresh</p>
                     <p className="text-xs text-muted-foreground">Automatically check rankings every 24 hours</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">Enabled</span>
                   </div>
                 </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function KeywordsTab({ projectId }: { projectId: number }) {
  const { data: keywords, isLoading } = useKeywords(projectId);
  const { mutate: createKeyword, isPending: isCreating } = useCreateKeyword();
  const { mutate: deleteKeyword, isPending: isDeleting } = useDeleteKeyword();
  const [open, setOpen] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);

  const form = useForm<InsertKeyword>({
    resolver: zodResolver(insertKeywordSchema),
    defaultValues: {
      projectId,
      term: "",
      location: "United States",
    },
  });

  const onSubmit = (data: InsertKeyword) => {
    const normalizedData = {
      ...data,
      term: data.term.toLowerCase().trim()
    };
    createKeyword(normalizedData, {
      onSuccess: () => {
        setOpen(false);
        form.reset({ projectId, term: "", location: "United States" });
      },
    });
  };

  const selectedKeyword = keywords?.find(k => k.id === selectedKeywordId) || keywords?.[0];

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Tracked Keywords</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Keyword
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10">
              <DialogHeader>
                <DialogTitle>Track Keyword</DialogTitle>
                <DialogDescription>Add a keyword to track its ranking position.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Keyword Term</Label>
                        <FormControl>
                          <Input placeholder="seo agency" {...field} className="bg-background/50 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating} className="bg-primary">
                      {isCreating ? "Adding..." : "Track Keyword"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-muted-foreground border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Keyword</th>
                  <th className="px-6 py-4 text-left font-medium">Location</th>
                  <th className="px-6 py-4 text-center font-medium">Rank</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {keywords?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No keywords tracked yet. Add one to start tracking.
                    </td>
                  </tr>
                ) : (
                  keywords?.map((keyword) => {
                    const latestRank = keyword.history?.[keyword.history.length - 1]?.googleRank;
                    return (
                      <tr 
                        key={keyword.id} 
                        className={cn(
                          "group hover:bg-white/5 transition-colors cursor-pointer",
                          selectedKeywordId === keyword.id ? "bg-primary/5" : ""
                        )}
                        onClick={() => setSelectedKeywordId(keyword.id)}
                      >
                        <td className="px-6 py-4 font-medium text-white">{keyword.term}</td>
                        <td className="px-6 py-4 text-muted-foreground">{keyword.location}</td>
                        <td className="px-6 py-4 text-center">
                          {latestRank ? (
                            <Badge variant="outline" className={cn(
                              "border-0 font-bold min-w-[30px] justify-center",
                              latestRank <= 3 ? "bg-green-500/20 text-green-500" :
                              latestRank <= 10 ? "bg-blue-500/20 text-blue-500" :
                              "bg-white/10 text-muted-foreground"
                            )}>
                              {latestRank}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteKeyword({ id: keyword.id, projectId });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Performance</h3>
        {selectedKeyword ? (
          <div className="space-y-6">
            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-primary" />
                  30-Day Ranking Trend: "{selectedKeyword.term}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KeywordRankChart history={selectedKeyword.history || []} />
              </CardContent>
            </Card>
            
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-primary" />
                Google SERP Snapshot (Top 10)
              </h4>
              <div className="space-y-2">
                {selectedKeyword.history?.[selectedKeyword.history.length - 1]?.serpData?.google?.map((res: any) => (
                  <div key={res.position} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                    <span className="w-6 text-center font-bold text-muted-foreground group-hover:text-primary transition-colors">{res.position}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{res.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{res.url}</p>
                    </div>
                  </div>
                )) || <p className="text-xs text-muted-foreground italic">No SERP data available yet.</p>}
              </div>
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Insights
              </h4>
              <p className="text-sm text-muted-foreground">
                Ranking history is tracked daily. Last checked {selectedKeyword.lastCheck ? new Date(selectedKeyword.lastCheck).toLocaleDateString() : 'Never'}.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-white/5 rounded-2xl p-8 text-center text-muted-foreground">
            Select a keyword to view performance trends.
          </div>
        )}
      </div>
    </div>
  );
}

function CompetitorsTab({ projectId }: { projectId: number }) {
  const { data: competitors, isLoading } = useCompetitors(projectId);
  const { mutate: createCompetitor, isPending: isCreating } = useCreateCompetitor();
  const [open, setOpen] = useState(false);

  const form = useForm<InsertCompetitor>({
    resolver: zodResolver(insertCompetitorSchema),
    defaultValues: {
      projectId,
      domain: "",
    },
  });

  const onSubmit = (data: InsertCompetitor) => {
    const normalizedData = {
      ...data,
      domain: normalizeUrl(data.domain)
    };
    createCompetitor(normalizedData, {
      onSuccess: () => {
        setOpen(false);
        form.reset({ projectId, domain: "" });
      },
    });
  };

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-lg font-medium text-white">Competitor Analysis</h3>
           <p className="text-sm text-muted-foreground">Monitor backlinks and metrics for competing domains.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Competitor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
              <DialogDescription>Enter a domain to analyze backlinks.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Domain URL</Label>
                      <FormControl>
                        <Input placeholder="competitor.com" {...field} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="bg-primary">
                    {isCreating ? "Adding..." : "Add Competitor"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors?.length === 0 ? (
           <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-12 text-center">
             <p className="text-muted-foreground">No competitors added yet.</p>
           </div>
        ) : (
          competitors?.map((competitor) => (
            <div key={competitor.id} className="bg-card border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-colors group">
               <div className="flex items-start justify-between mb-4">
                 <div>
                   <h4 className="font-bold text-white text-lg">{competitor.domain}</h4>
                   <p className="text-xs text-muted-foreground">Competitor</p>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                   <TrendingUp className="w-4 h-4" />
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-background/50 rounded-lg p-3 border border-white/5">
                   <p className="text-xs text-muted-foreground mb-1">Total Backlinks</p>
                   <p className="text-2xl font-bold text-white">{competitor.backlinksCount || 0}</p>
                 </div>
                 
                 <div>
                   <p className="text-xs font-medium text-white mb-2 uppercase tracking-wider">Top Backlinks</p>
                   {competitor.topBacklinks && (competitor.topBacklinks as string[]).length > 0 ? (
                     <ul className="space-y-2">
                       {(competitor.topBacklinks as string[]).slice(0, 3).map((link, idx) => (
                         <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                           <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0"></span>
                           <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline truncate">
                             {link}
                           </a>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-xs text-muted-foreground italic">No backlinks found yet.</p>
                   )}
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
