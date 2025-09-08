import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaces, createWorkspace, getWorkspaceMembers } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Workspace } from "@/types";

// Query keys for React Query
export const workspaceKeys = {
  all: ["workspaces"] as const,
  lists: () => [...workspaceKeys.all, "list"] as const,
  list: () => [...workspaceKeys.lists()] as const,
  members: (workspaceId: string) =>
    [...workspaceKeys.all, "members", workspaceId] as const,
};

// Hook to get all workspaces for the current user
export const useWorkspaces = () => {
  const { setWorkspaces, setLoading, setError } = useWorkspaceStore();

  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await getWorkspaces();
        // Transform memberships to workspaces
        const workspaces = data.map((membership: any) => membership.workspace);
        setWorkspaces(workspaces);
        setError(null);
        return workspaces;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch workspaces"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
};

// Hook to create a new workspace
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const { addWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (newWorkspace: Workspace) => {
      // Update the store
      addWorkspace(newWorkspace);

      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
};

// Hook to get workspace members
export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
};
