import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCompetitor } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCompetitors(projectId: number) {
  return useQuery({
    queryKey: [api.competitors.listByProject.path, projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const url = buildUrl(api.competitors.listByProject.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch competitors");
      return api.competitors.listByProject.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCompetitor) => {
      const validated = api.competitors.create.input.parse(data);
      const res = await fetch(api.competitors.create.path, {
        method: api.competitors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.competitors.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add competitor");
      }
      return api.competitors.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.competitors.listByProject.path, data.projectId] 
      });
      toast({ title: "Competitor added", description: "Analysis started for competitor." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
