import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getAllTasksInWorkspace,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Task } from "@/types";

// Query keys for React Query
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (workspaceId: string, projectId: string) =>
    [...taskKeys.lists(), workspaceId, projectId] as const,
  allInWorkspace: (workspaceId: string) =>
    [...taskKeys.lists(), workspaceId, "all"] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

// Hook to get all tasks for a project
export const useTasks = (workspaceId: string, projectId: string) => {
  const { setTasks, setLoading, setError } = useWorkspaceStore();

  return useQuery({
    queryKey: taskKeys.list(workspaceId, projectId),
    queryFn: async () => {
      setLoading(true);
      try {
        const tasks = await getTasks(workspaceId, projectId);
        setTasks(tasks || []);
        setError(null);
        return tasks || [];
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch tasks"
        );
        setTasks([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!workspaceId && !!projectId && projectId !== "skip",
  });
};

// Hook to get all tasks in a workspace (across all projects)
export const useAllTasksInWorkspace = (
  workspaceId: string,
  enabled: boolean = true
) => {
  const { setTasks, setLoading, setError } = useWorkspaceStore();

  return useQuery({
    queryKey: taskKeys.allInWorkspace(workspaceId),
    queryFn: async () => {
      setLoading(true);
      try {
        const tasks = await getAllTasksInWorkspace(workspaceId);
        setTasks(tasks || []);
        setError(null);
        return tasks || [];
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch tasks"
        );
        setTasks([]);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!workspaceId && enabled,
  });
};

// Hook to create a new task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskData,
    }: {
      workspaceId: string;
      projectId: string;
      taskData: {
        title: string;
        description?: string;
        assigneeId?: string;
      };
    }) => createTask(workspaceId, projectId, taskData),
    onSuccess: (newTask: Task, variables) => {
      // Update the store
      addTask(newTask);

      // Invalidate and refetch tasks for this project
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.workspaceId, variables.projectId),
      });
    },
  });
};

// Hook to update a task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
      updates,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
      updates: Partial<Task>;
    }) => updateTask(workspaceId, projectId, taskId, updates),
    onSuccess: (updatedTask: Task, variables) => {
      // Don't update the store here since we're doing optimistic updates
      // The optimistic update is handled in the component

      // Invalidate and refetch tasks for this project to sync with server
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.workspaceId, variables.projectId),
      });

      // Also invalidate all workspace tasks if applicable
      queryClient.invalidateQueries({
        queryKey: taskKeys.allInWorkspace(variables.workspaceId),
      });
    },
  });
};

// Hook to delete a task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { removeTask } = useWorkspaceStore();

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      taskId,
    }: {
      workspaceId: string;
      projectId: string;
      taskId: string;
    }) => deleteTask(workspaceId, projectId, taskId),
    onSuccess: (_, variables) => {
      // Update the store
      removeTask(variables.taskId);

      // Invalidate and refetch tasks for this project
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.workspaceId, variables.projectId),
      });
    },
  });
};
