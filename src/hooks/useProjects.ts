import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Project } from "@/types";

// Query keys for React Query
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (workspaceId: string) => [...projectKeys.lists(), workspaceId] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (projectId: string) => [...projectKeys.details(), projectId] as const,
};

// Hook to get all projects for a workspace
export const useProjects = (workspaceId: string) => {
  const { setProjects, setLoading, setError } = useWorkspaceStore();

  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: async () => {
      setLoading(true);
      try {
        const projects = await getProjects(workspaceId);
        setProjects(projects);
        setError(null);
        return projects;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch projects"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!workspaceId,
  });
};

// Hook to create a new project
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { addProject } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({
      workspaceId,
      name,
    }: {
      workspaceId: string;
      name: string;
    }) => createProject(workspaceId, name),
    onSuccess: (newProject: Project, variables) => {
      // Update the store
      addProject(newProject);

      // Invalidate and refetch projects for this workspace
      queryClient.invalidateQueries({
        queryKey: projectKeys.list(variables.workspaceId),
      });
    },
  });
};
