import axios from "axios";
import { Project, Task, WorkspaceMember } from "@/types";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const storage = localStorage.getItem("auth-storage");
    if (storage) {
      try {
        const parsedStorage = JSON.parse(storage);
        const token = parsedStorage?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("Token:", token);
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear the auth storage
      localStorage.removeItem("auth-storage");
      // Optionally redirect to login page
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API FUNCTIONS ============
export const sendEmailOtp = async (email: string) => {
  const { data } = await apiClient.post("/auth/send-otp", { email });
  return data;
};

export const verifyOtp = async (payload: {
  email: string;
  otp: string;
  username: string;
  password: string;
}) => {
  const { data } = await apiClient.post("/auth/verify-otp", payload);
  return data;
};

export const login = async (credentials: {
  username: string;
  password: string;
}) => {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
};

// ============ WORKSPACE API FUNCTIONS ============
export const createWorkspace = async (name: string) => {
  const { data } = await apiClient.post("/dashboard/workspaces/create", {
    name,
  });
  return data.workspace;
};

export const getWorkspaces = async () => {
  const { data } = await apiClient.get("/dashboard/workspaces");
  return data.memberships;
};

export const getWorkspaceMembers = async (
  workspaceId: string
): Promise<WorkspaceMember[]> => {
  const { data } = await apiClient.get(
    `/dashboard/workspaces/${workspaceId}/members`
  );
  return data.members;
};

// ============ PROJECT API FUNCTIONS ============
export const createProject = async (workspaceId: string, name: string) => {
  const { data } = await apiClient.post(
    `/dashboard/workspaces/${workspaceId}/projects/create`,
    { name }
  );
  return data.project;
};

export const getProjects = async (workspaceId: string): Promise<Project[]> => {
  const { data } = await apiClient.get(
    `/dashboard/workspaces/${workspaceId}/projects`
  );
  return data.projects;
};

// ============ TASK API FUNCTIONS ============
export const createTask = async (
  workspaceId: string,
  projectId: string,
  taskData: {
    title: string;
    description?: string;
    assigneeId?: string;
  }
) => {
  const { data } = await apiClient.post(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks/create`,
    taskData
  );
  return data.task;
};

export const getTasks = async (
  workspaceId: string,
  projectId: string
): Promise<Task[]> => {
  const { data } = await apiClient.get(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks`
  );
  return data.tasks;
};

export const getAllTasksInWorkspace = async (
  workspaceId: string
): Promise<Task[]> => {
  const { data } = await apiClient.get(
    `/dashboard/workspaces/${workspaceId}/projects/allTasks`
  );
  return data.tasks;
};

export const updateTask = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  updates: Partial<Task>
) => {
  const { data } = await apiClient.put(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/update`,
    updates
  );
  return data.task;
};

export const deleteTask = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const { data } = await apiClient.delete(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/delete`
  );
  return data;
};

// ============ COMMENT API FUNCTIONS ============
export const addComment = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  content: string
) => {
  const { data } = await apiClient.post(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/add`,
    { content }
  );
  return data.comment;
};

export const getComments = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const { data } = await apiClient.get(
    `/dashboard/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`
  );
  return data.comments;
};

export default apiClient;
