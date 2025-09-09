import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addComment, getComments } from "@/lib/api";
import { taskKeys } from "./useTasks";

// Query keys for comments
export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (workspaceId: string, projectId: string, taskId: string) =>
    [...commentKeys.lists(), workspaceId, projectId, taskId] as const,
};

// Hook to get comments for a specific task
export const useComments = (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  return useQuery({
    queryKey: commentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => getComments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};

// Hook to add a comment to a task
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
      content,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
      content: string;
    }) => addComment(workspaceId, projectId, taskId, content),
    onSuccess: (_, variables) => {
      // Invalidate and refetch tasks to get updated comments
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.workspaceId, variables.projectId),
      });

      // Also invalidate the specific comments query
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(
          variables.workspaceId,
          variables.projectId,
          variables.taskId
        ),
      });

      // Invalidate all workspace tasks if applicable
      queryClient.invalidateQueries({
        queryKey: taskKeys.allInWorkspace(variables.workspaceId),
      });
    },
  });
};
