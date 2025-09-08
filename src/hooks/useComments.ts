import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "@/lib/api";
import { taskKeys } from "./useTasks";

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
    },
  });
};
