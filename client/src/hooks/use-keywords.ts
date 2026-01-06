import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertKeyword } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useKeywords(projectId: number) {
  return useQuery({
    queryKey: [api.keywords.listByProject.path, projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const url = buildUrl(api.keywords.listByProject.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch keywords");
      return api.keywords.listByProject.responses[200].parse(await res.json());
    },
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertKeyword) => {
      const validated = api.keywords.create.input.parse(data);
      const res = await fetch(api.keywords.create.path, {
        method: api.keywords.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.keywords.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add keyword");
      }
      return api.keywords.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.keywords.listByProject.path, data.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [api.projects.get.path, data.projectId] 
      });
      toast({ title: "Keyword added", description: "Now tracking keyword ranking." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: number; projectId: number }) => {
      const url = buildUrl(api.keywords.delete.path, { id });
      const res = await fetch(url, {
        method: api.keywords.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete keyword");
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.keywords.listByProject.path, projectId] 
      });
      toast({ title: "Keyword removed", description: "Stopped tracking keyword." });
    },
  });
}
