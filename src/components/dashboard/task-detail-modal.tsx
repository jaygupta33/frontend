"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MessageSquare,
  Flag,
  User,
  FileText,
  Clock,
  GitBranch,
  Activity,
  Link,
  Plus,
  MoreHorizontal,
  Edit,
  Send,
  Code,
} from "lucide-react";
import { Task } from "@/types";
import { useState, useEffect } from "react";
import { useAddComment } from "@/hooks";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/hooks/useTasks";

interface TaskDetailModalProps {
  readonly task: Task | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

// Mock data for enhanced features
const mockActivityLogs = [
  {
    id: "1",
    type: "status_change",
    user: "John Doe",
    action: "moved this task from To Do to In Progress",
    timestamp: "2025-01-08T10:30:00Z",
    avatar: "JD",
  },
  {
    id: "2",
    type: "comment",
    user: "Jane Smith",
    action: "added a comment",
    timestamp: "2025-01-08T09:15:00Z",
    avatar: "JS",
  },
  {
    id: "3",
    type: "assignment",
    user: "Admin",
    action: "assigned this task to John Doe",
    timestamp: "2025-01-07T16:45:00Z",
    avatar: "AD",
  },
  {
    id: "4",
    type: "github",
    user: "Bot",
    action: "linked GitHub PR #123",
    timestamp: "2025-01-07T14:20:00Z",
    avatar: "🤖",
  },
];

const mockGithubConnections = [
  {
    id: "1",
    type: "pull_request",
    title: "Fix: Update task status validation",
    number: 123,
    status: "open",
    url: "https://github.com/repo/pull/123",
  },
  {
    id: "2",
    type: "branch",
    name: "feature/task-improvements",
    status: "active",
    url: "https://github.com/repo/tree/feature/task-improvements",
  },
];

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "activity" | "github">(
    "details"
  );

  const { currentWorkspace, currentProject } = useWorkspaceStore();
  const addCommentMutation = useAddComment();
  const queryClient = useQueryClient();

  // Monitor task changes
  useEffect(() => {
    console.log("Task prop changed:", task);
    console.log("Comments in task:", task?.comments?.length || 0);
  }, [task]);

  if (!task) return null;

  const projectId =
    currentProject?.id === "all"
      ? task.projectId
      : currentProject?.id || task.projectId;

  // Get the latest task data from the query cache
  const getLatestTask = () => {
    const projectTasks = queryClient.getQueryData(
      taskKeys.list(currentWorkspace?.id || "", projectId)
    );
    const allTasks = queryClient.getQueryData(
      taskKeys.allInWorkspace(currentWorkspace?.id || "")
    );

    const tasks = currentProject?.id === "all" ? allTasks : projectTasks;
    const latestTask = (tasks as Task[])?.find((t) => t.id === task.id);

    console.log("Latest task from cache:", latestTask);
    console.log("Latest task comments:", latestTask?.comments?.length || 0);

    return latestTask || task;
  };

  const currentTask = getLatestTask();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return formatDateTime(dateString);
    } catch {
      return dateString;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <Flag className="h-4 w-4 text-red-500" />;
      case "MEDIUM":
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case "LOW":
        return <Flag className="h-4 w-4 text-green-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "LOW":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleAddComment = () => {
    console.log("handleAddComment called");
    console.log("newComment:", newComment);
    console.log("workspaceId:", currentWorkspace?.id);
    console.log("projectId:", projectId);
    console.log("taskId:", task.id);

    if (!newComment.trim()) {
      console.log("Comment is empty, returning");
      return;
    }

    if (!currentWorkspace?.id) {
      console.error("Workspace ID is missing");
      return;
    }

    if (!projectId) {
      console.error("Project ID is missing");
      return;
    }

    console.log("Starting mutation with data:", {
      workspaceId: currentWorkspace?.id,
      projectId,
      taskId: task.id,
      content: newComment.trim(),
    });

    addCommentMutation.mutate(
      {
        workspaceId: currentWorkspace?.id || "",
        projectId,
        taskId: task.id,
        content: newComment.trim(),
      },
      {
        onSuccess: (data) => {
          console.log("Comment mutation successful:", data);
          setNewComment("");

          // Force invalidate and refetch all related queries
          queryClient.invalidateQueries({
            queryKey: taskKeys.list(currentWorkspace?.id || "", projectId),
          });

          queryClient.invalidateQueries({
            queryKey: taskKeys.allInWorkspace(currentWorkspace?.id || ""),
          });

          // Force refetch to ensure UI updates immediately
          queryClient.refetchQueries({
            queryKey: taskKeys.list(currentWorkspace?.id || "", projectId),
          });

          queryClient.refetchQueries({
            queryKey: taskKeys.allInWorkspace(currentWorkspace?.id || ""),
          });
        },
        onError: (error) => {
          console.error("Failed to add comment:", error);
          // You could show a toast notification here
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[75vw] w-[75vw] max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(currentTask.priority)}
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      {currentTask.title || "Untitled Task"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {currentTask.project?.name ||
                          currentTask.projectName ||
                          "No Project"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Created {getRelativeTime(currentTask.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex space-x-8 px-6">
                {[
                  { id: "details", label: "Details", icon: FileText },
                  { id: "activity", label: "Activity", icon: Activity },
                  { id: "github", label: "Development", icon: Code },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "details" && (
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Description</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          defaultValue={currentTask.description || ""}
                          placeholder="Add a description..."
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm">Save</Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {currentTask.description || (
                          <div className="italic text-gray-400">
                            No description provided. Click Edit to add one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Comments Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({currentTask.comments?.length || 0})
                    </h3>

                    {/* Add Comment */}
                    <div className="mb-4 p-3 border rounded-lg">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            You
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                (e.ctrlKey || e.metaKey)
                              ) {
                                e.preventDefault();
                                handleAddComment();
                              }
                            }}
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">
                              Pro tip: Use @ to mention someone, Ctrl+Enter to
                              submit
                            </div>
                            <Button
                              size="sm"
                              onClick={handleAddComment}
                              disabled={
                                !newComment.trim() ||
                                addCommentMutation.isPending
                              }
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {addCommentMutation.isPending
                                ? "Adding..."
                                : "Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Existing Comments */}
                    <div className="space-y-4">
                      {currentTask.comments &&
                      currentTask.comments.length > 0 ? (
                        currentTask.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {comment.user.username
                                  ?.substring(0, 2)
                                  .toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {comment.user.username}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {getRelativeTime(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No comments yet</p>
                          <p className="text-xs">
                            Be the first to comment on this task
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="p-6">
                  <div className="space-y-4">
                    {mockActivityLogs.map((log) => (
                      <div key={log.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {log.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {log.user}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {log.action}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getRelativeTime(log.timestamp)}
                            </span>
                          </div>
                          {log.type === "status_change" && (
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                To Do
                              </Badge>
                              <span className="text-xs">→</span>
                              <Badge variant="outline" className="text-xs">
                                In Progress
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "github" && (
                <div className="p-6 space-y-6">
                  {/* GitHub Connections */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        GitHub Integration
                      </h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Link Branch/PR
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {mockGithubConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {connection.type === "pull_request" ? (
                              <GitBranch className="h-4 w-4 text-green-600" />
                            ) : (
                              <GitBranch className="h-4 w-4 text-blue-600" />
                            )}
                            <div>
                              <div className="text-sm font-medium">
                                {connection.type === "pull_request"
                                  ? `PR #${connection.number}: ${connection.title}`
                                  : `Branch: ${connection.name}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Status: {connection.status}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Link className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Development Actions */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <GitBranch className="h-3 w-3 mr-2" />
                        Create Branch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <Code className="h-3 w-3 mr-2" />
                        Create PR
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-gray-50/50 p-6 space-y-6">
            {/* Status */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="w-full justify-center py-2">
                  {currentTask.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assignee
              </div>
              <div className="mt-2">
                {currentTask.assignee ? (
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {currentTask.assignee.username
                          ?.substring(0, 2)
                          .toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {currentTask.assignee.username}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Unassigned
                  </Button>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Priority
              </div>
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className={`w-full justify-center py-2 ${getPriorityColor(
                    currentTask.priority || "LOW"
                  )}`}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {currentTask.priority || "LOW"}
                </Badge>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due Date
              </div>
              <div className="mt-2">
                {currentTask.dueDate ? (
                  <div className="flex items-center gap-2 p-2 rounded-md border">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(currentTask.dueDate)}
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Set due date
                  </Button>
                )}
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Labels
              </div>
              <div className="mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add labels
                </Button>
              </div>
            </div>

            {/* Time Tracking */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Time Tracking
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Estimated: 4h</span>
                  <span>Logged: 2h 30m</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "62%" }}
                  ></div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Log time
                </Button>
              </div>
            </div>

            {/* Created */}
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatDateTime(currentTask.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
