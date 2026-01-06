import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, Search, BookOpen, MessageSquare } from "lucide-react";
import { api } from "@shared/routes";

export default function ContentIdeasPage() {
  const [keyword, setKeyword] = useState("");
  
  const mutation = useMutation({
    mutationFn: async (kw: string) => {
      const res = await apiRequest("POST", api.settings.generateContentIdeas.path, { keyword: kw });
      return res.json();
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    mutation.mutate(keyword);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content Ideas</h1>
        <p className="text-muted-foreground">
          Enter a keyword to generate blog post titles and common questions using AI.
        </p>
      </div>

      <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Topic Research
          </CardTitle>
          <CardDescription>What topic are you looking for ideas for?</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="flex gap-4">
            <Input
              placeholder="e.g. digital marketing for small business"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Ideas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {mutation.data && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Blog Post Titles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mutation.data.blogTitles.map((title: string, i: number) => (
                  <li key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/50 transition-colors">
                    {title}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/40 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                People Also Ask
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mutation.data.questions.map((q: string, i: number) => (
                  <li key={i} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/50 transition-colors">
                    {q}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
