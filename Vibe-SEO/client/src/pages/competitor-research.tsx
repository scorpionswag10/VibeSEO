import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Link as LinkIcon, Globe, ShieldCheck } from "lucide-react";

export default function CompetitorResearch() {
  const [url, setUrl] = useState("");
  const [searchUrl, setSearchUrl] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/competitor-research", searchUrl],
    queryFn: async () => {
      if (!searchUrl) return null;
      const res = await fetch(buildUrl(api.settings.competitorResearch.path, { url: searchUrl }));
      if (!res.ok) throw new Error("Failed to fetch research data");
      return res.json();
    },
    enabled: !!searchUrl,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) setSearchUrl(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Competitor Research</h1>
        <p className="text-muted-foreground">Analyze backlink profiles and domain strength of any URL.</p>
      </div>

      <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl overflow-visible">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter competitor URL (e.g. competitor.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-background/50 border-white/10 h-11"
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading} className="bg-primary hover:bg-primary/90 min-w-[120px]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-blue-500" /> Total Backlinks
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{data.totalBacklinks.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" /> Referring Domains
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{data.referringDomains.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" /> Domain Authority
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{data.domainRating}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Top Referring Domains</CardTitle>
              <CardDescription>Highest authority websites linking to {searchUrl}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead>Domain</TableHead>
                    <TableHead>DR</TableHead>
                    <TableHead className="text-right">Date Discovered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topReferringDomains.map((domain: any, idx: number) => (
                    <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{domain.domain}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {domain.dr}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{domain.dateDiscovered}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {!data && !isLoading && !searchUrl && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
          <Globe className="h-16 w-16 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="text-xl font-medium text-white">No analysis yet</h3>
            <p className="max-w-xs mx-auto">Enter a URL above to start researching your competitor's backlink profile.</p>
          </div>
        </div>
      )}
    </div>
  );
}
