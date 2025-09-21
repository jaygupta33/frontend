import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Workspace, Project, Task } from "@/types";

// Define the shape of the workspace store's state and actions
interface WorkspaceState {
  // Current workspace data
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];

  // Current project and task data
  currentProject: Project | null;
  projects: Project[];
  tasks: Task[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions for workspace management
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  clearWorkspaces: () => void;

  // Actions for project management
  setCurrentProject: (project: Project) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  clearProjects: () => void;

  // Actions for task management
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  clearTasks: () => void;

  // Actions for UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export const useWorkspaceStore = create(
  persist<WorkspaceState>(
    (set, get) => ({
      // Initial state
      currentWorkspace: null,
      workspaces: [],
      currentProject: null,
      projects: [],
      tasks: [],
      isLoading: false,
      error: null,

      // Workspace actions
      setCurrentWorkspace: (workspace) => {
        const currentState = get();
        // Clear current project if workspace is null or if project doesn't belong to the new workspace
        const shouldClearProject =
          !workspace ||
          (currentState.currentProject &&
            currentState.currentProject.workspaceId !== workspace.id);

        set({
          currentWorkspace: workspace,
          ...(shouldClearProject && { currentProject: null }),
        });
      },
      setWorkspaces: (workspaces) => set({ workspaces }),
      addWorkspace: (workspace) => {
        const { workspaces } = get();
        set({ workspaces: [...workspaces, workspace] });
      },
      clearWorkspaces: () => set({ workspaces: [], currentWorkspace: null }),

      // Project actions
      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => set({ projects }),
      addProject: (project) => {
        const { projects } = get();
        set({ projects: [...projects, project] });
      },
      clearProjects: () => set({ projects: [], currentProject: null }),

      // Task actions
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => {
        const { tasks } = get();
        set({ tasks: [...tasks, task] });
      },
      updateTask: (taskId, updates) => {
        const { tasks } = get();
        set({
          tasks: tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        });
      },
      removeTask: (taskId) => {
        const { tasks } = get();
        set({ tasks: tasks.filter((task) => task.id !== taskId) });
      },
      clearTasks: () => set({ tasks: [] }),

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearAll: () =>
        set({
          currentWorkspace: null,
          workspaces: [],
          currentProject: null,
          projects: [],
          tasks: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "workspace-storage",
    }
  )
);
