import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { Link } from "wouter";
import { Plus, Globe, ArrowRight, Loader2, TrendingUp, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Globe2 } from "lucide-react";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const [open, setOpen] = useState(false);
  const [engineCompare, setEngineCompare] = useState(false);
  const [showGlobalPulse, setShowGlobalPulse] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: syncNow, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/keywords/sync");
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: "Keyword rankings are being updated in the background.",
      });
      // Invalidate projects to eventually show updated lastCheck/ranks
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Could not start keyword synchronization.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const onSubmit = (data: InsertProject) => {
    createProject(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalProjects = projects?.length || 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your tracked projects and performance.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => syncNow()} 
            disabled={isSyncing}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
            Sync Now
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-white/10 bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Track a new website's SEO performance.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Project Name</Label>
                        <FormControl>
                          <Input placeholder="My Awesome Blog" {...field} className="bg-background/50 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Website URL</Label>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} className="bg-background/50 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isCreating} className="bg-primary text-white">
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Project
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-white/5 shadow-xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Projects</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="global-pulse" className="text-[10px] text-muted-foreground uppercase">Global Pulse</Label>
              <Switch 
                id="global-pulse" 
                checked={showGlobalPulse} 
                onCheckedChange={setShowGlobalPulse}
                className="scale-75"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="engine-compare" className="text-[10px] text-muted-foreground uppercase">Google vs Bing</Label>
              <Switch 
                id="engine-compare" 
                checked={engineCompare} 
                onCheckedChange={setEngineCompare}
                className="scale-75"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{totalProjects}</span>
              <span className="text-sm text-primary font-medium">+1 this week</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Keywords Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">--</span>
              <span className="text-sm text-muted-foreground">across all projects</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">--</span>
              <span className="text-sm text-green-500 font-medium">▲ 2.4</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Active Projects
        </h2>
        
        {projects?.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center bg-card/20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start tracking your SEO performance by adding your first project.</p>
            <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">Add First Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="group relative bg-card hover:bg-card/80 border border-white/5 hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    <span className="font-bold text-lg text-white">{project.name.charAt(0)}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-sm text-muted-foreground truncate mb-6">{project.url}</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Google: {project.keywords?.[0]?.history?.[project.keywords?.[0]?.history?.length - 1]?.googleRank || "--"}</span>
                    </div>
                    {engineCompare && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground animate-in fade-in slide-in-from-left-2">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Bing: {project.keywords?.[0]?.history?.[project.keywords?.[0]?.history?.length - 1]?.bingRank || "--"}</span>
                      </div>
                    )}
                    {showGlobalPulse && (
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border-l border-white/10 pl-4 ml-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="font-bold text-white">🇺🇸</span> {project.keywords?.[0]?.history?.[project.keywords?.[0]?.history?.length - 1]?.googleRanks?.us || "--"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="font-bold text-white">🇬🇧</span> {project.keywords?.[0]?.history?.[project.keywords?.[0]?.history?.length - 1]?.googleRanks?.uk || "--"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="font-bold text-white">🇨🇦</span> {project.keywords?.[0]?.history?.[project.keywords?.[0]?.history?.length - 1]?.googleRanks?.ca || "--"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
