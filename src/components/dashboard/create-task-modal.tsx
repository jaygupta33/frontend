"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Flag } from "lucide-react";
import { useCreateTask } from "@/hooks/useTasks";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { Priority, TaskStatus } from "@/types";

interface CreateTaskModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly projectId?: string; // If provided, pre-select this project
  readonly initialStatus?: TaskStatus; // If provided, pre-select this status
}

interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  projectId: string;
  dueDate?: string; // Change to string for date input
  assigneeId?: string;
}

const priorityOptions = [
  { value: Priority.LOW, label: "Low", color: "text-green-600" },
  { value: Priority.MEDIUM, label: "Medium", color: "text-yellow-600" },
  { value: Priority.HIGH, label: "High", color: "text-red-600" },
];

const statusOptions = [
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId: initialProjectId,
  initialStatus = TaskStatus.TODO,
}: CreateTaskModalProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { data: projects = [] } = useProjects(currentWorkspace?.id || "");
  const { data: members = [] } = useWorkspaceMembers(
    currentWorkspace?.id || ""
  );
  const createTaskMutation = useCreateTask();

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: Priority.MEDIUM,
    status: initialStatus,
    projectId: initialProjectId || "",
    dueDate: "",
    assigneeId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: Priority.MEDIUM,
      status: initialStatus,
      projectId: initialProjectId || "",
      dueDate: "",
      assigneeId: undefined,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Project selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      setErrors({ general: "No workspace selected" });
      return;
    }

    createTaskMutation.mutate(
      {
        workspaceId,
        projectId: formData.projectId,
        taskData: {
          title: formData.title,
          description: formData.description || undefined,
          assigneeId: formData.assigneeId || undefined,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
        },
      },
      {
        onSuccess: () => {
          handleClose();
          // The refetching is handled automatically by the useCreateTask hook
        },
        onError: (error) => {
          setErrors({
            general: error.message || "Failed to create task",
          });
        },
      }
    );
  };

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Add a detailed description..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project-select" className="text-sm font-medium">
                Project <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger
                  id="project-select"
                  className={errors.projectId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-sm text-red-500">{errors.projectId}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status-select" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as TaskStatus,
                  }))
                }
              >
                <SelectTrigger id="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority-select" className="text-sm font-medium">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value as Priority,
                  }))
                }
              >
                <SelectTrigger id="priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <Flag className={`h-3 w-3 ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due-date-input" className="text-sm font-medium">
                Due Date
              </Label>
              <div className="relative">
                <Input
                  id="due-date-input"
                  type="date"
                  value={formatDateForInput(formData.dueDate)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  min={getCurrentDate()}
                  className="w-full"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {formData.dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, dueDate: "" }))
                  }
                  className="h-auto p-1 text-xs text-muted-foreground"
                >
                  Clear date
                </Button>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee-select" className="text-sm font-medium">
              Assignee
            </Label>
            <Select
              value={formData.assigneeId || "unassigned"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  assigneeId: value === "unassigned" ? undefined : value,
                }))
              }
            >
              <SelectTrigger id="assignee-select">
                <SelectValue placeholder="Select an assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">Unassigned</span>
                </SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {member.user?.username?.substring(0, 2).toUpperCase() ||
                          "??"}
                      </div>
                      {member.user?.username || "Unknown User"}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
