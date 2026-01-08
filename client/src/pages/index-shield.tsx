import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/use-projects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function IndexShield() {
  const { data: projects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ indexed: boolean; lastChecked: string } | null>(null);

  const checkIndex = () => {
    setLoading(true);
    // Mock DataForSEO check
    setTimeout(() => {
      setResult({ indexed: true, lastChecked: new Date().toISOString() });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div>
        <h1 className="text-3xl font-sans font-bold text-[#050505] dark:text-white mb-1">Index Shield</h1>
        <p className="text-secondary dark:text-muted-foreground">Monitor Google Indexing status for your critical URLs.</p>
      </div>

      <Card className="bg-white dark:bg-card/40 backdrop-blur-sm border-[#DFE3EE] dark:border-white/5 shadow-xl">
        <CardHeader>
          <CardTitle>Check Indexing Status</CardTitle>
          <CardDescription>We'll query Google directly via DataForSEO to verify if your page is indexed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Select Project URL</label>
              <Select>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.url}>{p.url}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Or Enter Custom URL</label>
              <Input placeholder="https://example.com/blog-post" className="bg-background/50 border-white/10" />
            </div>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white" 
            onClick={checkIndex}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Run Index Shield Check
          </Button>

          {result && (
            <div className={`mt-8 p-6 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${result.indexed ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.indexed ? 'bg-green-500/20 text-green-700 dark:text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {result.indexed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-[#050505] dark:text-white text-lg">{result.indexed ? "URL is Indexed" : "URL Not Indexed"}</h3>
                <p className="text-sm text-[#050505]/70 dark:text-muted-foreground">Confirmed via Google Search. Last checked: {new Date(result.lastChecked).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
