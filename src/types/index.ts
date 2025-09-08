export enum Role {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// --- Model Interfaces ---
// These interfaces represent the data structures for your application.

/**
 * Represents a user who has started the sign-up process but hasn't completed it.
 */
export interface PendingUser {
  id: string;
  email: string;
  name?: string | null;
  otp: string;
  otpExpiresAt: string; // ISO date string
  createdAt: string; // ISO date string
}

/**
 * Represents the full User object, matching your Prisma schema.
 * This type should primarily be used on the backend.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  workspaces: WorkspaceMember[];
  tasks: Task[];
  comments: Comment[];
  createdAt: string; // ISO date string
}

/**
 * A "safe" version of the User type for the frontend, omitting the password.
 */

/**
 * Represents a user's membership and role within a specific Workspace.
 */
export interface WorkspaceMember {
  id: string;
  role: Role;
  userId: string;
  workspaceId: string;
  user?: User; // Relation: Populated on the frontend
  workspace?: Workspace; // Relation: Populated on the frontend
}

/**
 * Represents a high-level container for projects and team members.
 */
export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  members: WorkspaceMember[];
  createdAt: string; // ISO date string
}

/**
 * Represents a project within a Workspace.
 */
export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  workspace?: Workspace; // Relation: Populated on the frontend
  tasks: Task[];
  _count?: {
    tasks: number;
  }; // Prisma count aggregation
  createdAt: string; // ISO date string
}

/**
 * Represents a single task within a Project.
 */
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null; // ISO date string
  assigneeId?: string | null;
  projectId: string;
  project?: Project; // Relation: Populated on the frontend
  projectName?: string; // Flat project name (used in getAllTasksInWorkspace)
  assignee?: User | null; // Relation: Populated on the frontend
  comments: Comment[];
  createdAt: string; // ISO date string
}

/**
 * Represents a comment made by a user on a Task.
 */
export interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  user: User; // Relation: Comments should always show the author
  task?: Task; // Relation: Populated on the frontend
  createdAt: string;
}
