"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Flag,
} from "lucide-react";
import {
  useTasks,
  useDeleteTask,
  useAllTasksInWorkspace,
  useUpdateTask,
} from "@/hooks";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Task, TaskStatus } from "@/types";
import { ProjectSelector } from "./project-selector";
import { TaskDetailModal } from "./task-detail-modal";
import { CreateTaskModal } from "./create-task-modal";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useMemo, useRef } from "react";

const columns = [
  { id: "TODO", title: "To Do", status: "TODO" as TaskStatus },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    status: "IN_PROGRESS" as TaskStatus,
  },
  { id: "DONE", title: "Done", status: "DONE" as TaskStatus },
];

function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-destructive text-destructive-foreground";
    case "MEDIUM":
      return "bg-chart-4 text-white";
    case "LOW":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPriorityIcon(priority: string) {
  let color = "text-muted-foreground";
  if (priority === "HIGH") {
    color = "text-destructive";
  } else if (priority === "MEDIUM") {
    color = "text-chart-4";
  }
  return <Flag className={`h-3 w-3 ${color}`} />;
}

function DraggableTaskCard({
  task,
  showProjectName = false,
  isUpdating = false,
  onTaskClick,
  onTaskDelete,
}: {
  readonly task: Task;
  readonly showProjectName?: boolean;
  readonly isUpdating?: boolean;
  readonly onTaskClick: (task: Task) => void;
  readonly onTaskDelete?: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 rotate-3 scale-105" : ""
      } ${isUpdating ? "opacity-75" : ""} transition-all duration-200`}
    >
      <TaskCard
        task={task}
        showProjectName={showProjectName}
        isUpdating={isUpdating}
        onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
}

function TaskCard({
  task,
  showProjectName = false,
  isUpdating = false,
  onTaskClick,
  onTaskDelete,
}: {
  readonly task: Task;
  readonly showProjectName?: boolean;
  readonly isUpdating?: boolean;
  readonly onTaskClick?: (task: Task) => void;
  readonly onTaskDelete?: (taskId: string) => void;
}) {
  const { currentWorkspace, currentProject } = useWorkspaceStore();
  const deleteTaskMutation = useDeleteTask();

  const projectId = currentProject?.id || task.projectId;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    // Show confirmation dialog for delete action
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    deleteTaskMutation.mutate(
      {
        workspaceId: currentWorkspace?.id || "",
        projectId,
        taskId: task.id,
      },
      {
        onSuccess: () => {
          // Call the callback to handle any UI updates (like closing modals)
          onTaskDelete?.(task.id);
        },
        onError: (error) => {
          console.error("Failed to delete task:", error);
          // You could show a toast notification here
          alert("Failed to delete task. Please try again.");
        },
      }
    );
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click originated from dropdown or its children
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-dropdown-trigger]") ||
      target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest("[role='menu']") ||
      target.closest("[data-radix-dropdown-menu-content]")
    ) {
      return;
    }
    onTaskClick?.(task);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Ensure task has required properties
  if (!task?.id) {
    return null;
  }

  return (
    <Card
      className={`mb-2 hover:shadow-md transition-shadow cursor-pointer ${
        isUpdating ? "ring-2 ring-primary/20" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getPriorityIcon(task.priority)}
              {showProjectName && (
                <Badge variant="outline" className="text-xs">
                  {task.project?.name || task.projectName || "No Project"}
                </Badge>
              )}
              {isUpdating && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  data-dropdown-trigger
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title and Description */}
          <div>
            <h4 className="font-medium text-sm leading-tight">
              {task.title || "Untitled Task"}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {task.assignee.username?.substring(0, 2).toUpperCase() ||
                      "??"}
                  </AvatarFallback>
                </Avatar>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </div>
              )}
            </div>
          </div>

          {/* Priority Badge */}
          <div className="flex justify-end">
            <Badge
              variant="secondary"
              className={`text-xs ${getPriorityColor(task.priority || "LOW")}`}
            >
              {task.priority || "LOW"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  column,
  tasks,
  showProjectName,
  updatingTaskIds,
  onTaskClick,
  onAddTask,
  onTaskDelete,
}: {
  readonly column: { id: string; title: string; status: TaskStatus };
  readonly tasks: Task[];
  readonly showProjectName: boolean;
  readonly updatingTaskIds: Set<string>;
  readonly onTaskClick: (task: Task) => void;
  readonly onAddTask: (status: TaskStatus) => void;
  readonly onTaskDelete?: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {column.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onAddTask(column.status)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div
            ref={setNodeRef}
            className={`flex-1 space-y-1 p-1 rounded-lg border-2 border-dashed transition-colors ${
              isOver
                ? "border-primary bg-primary/5"
                : "border-transparent hover:border-muted-foreground/25"
            }`}
            data-status={column.status}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task: Task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  showProjectName={showProjectName}
                  isUpdating={updatingTaskIds.has(task.id)}
                  onTaskClick={onTaskClick}
                  onTaskDelete={onTaskDelete}
                />
              ))}
            </SortableContext>
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TaskBoard() {
  const { currentWorkspace, currentProject } = useWorkspaceStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Use ref to track initialization to prevent Edge browser issues
  const hasInitializedRef = useRef(false);

  // Use the workspace ID and current project from store
  const projectId = currentProject?.id;
  const isAllProjects = projectId === "all";

  // Fetch tasks based on selection (single project or all projects)
  const {
    data: projectTasks = [],
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useTasks(
    currentWorkspace?.id || "",
    projectId && !isAllProjects ? projectId : "skip"
  );

  const {
    data: allWorkspaceTasks = [],
    isLoading: isAllTasksLoading,
    isError: isAllTasksError,
    error: allTasksError,
  } = useAllTasksInWorkspace(currentWorkspace?.id || "", isAllProjects);

  // Update task mutation
  const updateTaskMutation = useUpdateTask();

  // Handle task click to open modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle task deletion - close modal if the deleted task is currently selected
  const handleTaskDelete = (deletedTaskId: string) => {
    if (selectedTask && selectedTask.id === deletedTaskId) {
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Handle create modal close
  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  // Handle adding task from column
  const handleAddTaskFromColumn = (status: TaskStatus) => {
    setIsCreateModalOpen(true);
    // We could pre-set the status here if needed
  };

  // Determine which data to use - prioritize optimistic tasks for instant updates
  const serverTasks = useMemo(() => {
    return isAllProjects ? allWorkspaceTasks : projectTasks;
  }, [isAllProjects, allWorkspaceTasks, projectTasks]);

  // Use separate state to track if we should use optimistic or server tasks
  const [useOptimistic, setUseOptimistic] = useState(false);
  const displayTasks =
    useOptimistic && optimisticTasks.length > 0 ? optimisticTasks : serverTasks;

  const isLoading = isAllProjects ? isAllTasksLoading : isProjectLoading;
  const isError = isAllProjects ? isAllTasksError : isProjectError;
  const error = isAllProjects ? allTasksError : projectError;

  // Update optimistic tasks when server data changes - with better Edge compatibility
  useEffect(() => {
    // Reset optimistic flag when new server data arrives
    setUseOptimistic(false);

    // Always update optimistic tasks when server data changes
    if (serverTasks.length > 0) {
      setOptimisticTasks([...serverTasks]); // Create new array to ensure reference change
      hasInitializedRef.current = true;
    } else if (
      serverTasks.length === 0 &&
      !isLoading &&
      hasInitializedRef.current
    ) {
      setOptimisticTasks([]);
    }
  }, [serverTasks, isLoading]); // Add serverTasks directly as dependency

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const getTasksForColumn = (status: TaskStatus) => {
    if (!displayTasks || !Array.isArray(displayTasks)) {
      return [];
    }
    return displayTasks.filter((task: Task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = displayTasks.find((t: Task) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    let newStatus: TaskStatus;

    // Determine the new status based on what was dropped on
    const overId = over.id as string;

    // Check if dropped on a column directly
    if (columns.some((col) => col.id === overId)) {
      newStatus = overId as TaskStatus;
    } else {
      // If dropped on a task, find that task's status (column)
      const overTask = displayTasks.find((task: Task) => task.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        // Invalid drop target
        setActiveTask(null);
        return;
      }
    }

    // Find the task being moved
    const task = displayTasks.find((t: Task) => t.id === taskId);

    if (!task || task.status === newStatus) {
      setActiveTask(null);
      return;
    }

    // Optimistically update the local tasks state immediately
    const updatedTasks = displayTasks.map((t: Task) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setOptimisticTasks(updatedTasks);
    setUseOptimistic(true); // Enable optimistic mode

    // Mark task as updating
    setUpdatingTaskIds((prev) => new Set(prev).add(taskId));

    // Helper function to update task in list
    const updateTaskInList = (
      tasks: Task[],
      targetId: string,
      updatedTask: Task
    ) => tasks.map((t) => (t.id === targetId ? updatedTask : t));

    // Update the task status via API (this will happen in the background)
    updateTaskMutation.mutate(
      {
        workspaceId: currentWorkspace?.id || "",
        projectId: task.projectId,
        taskId,
        updates: { status: newStatus },
      },
      {
        onSuccess: (updatedTask) => {
          // Update the optimistic tasks with the server response
          setOptimisticTasks((prevTasks) =>
            updateTaskInList(prevTasks, taskId, updatedTask)
          );
          // Remove from updating set
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        },
        onError: (error) => {
          // If the API call fails, revert the optimistic update
          setOptimisticTasks((prevTasks) =>
            updateTaskInList(prevTasks, taskId, task)
          );
          // Remove from updating set
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
          console.error("Failed to update task status:", error);
          // You could show a toast notification here
        },
      }
    );

    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) return;

    const overId = over.id;

    // If dragging over a column container, allow it
    if (columns.some((col) => col.id === overId)) {
      return;
    }

    // If dragging over another task, find which column it belongs to
    const overTask = displayTasks.find((task: Task) => task.id === overId);
    if (overTask) {
      return;
    }
  };

  // Show project selector when no project is selected
  if (!currentProject || !projectId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground">
              Manage your tasks with drag-and-drop simplicity
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium mb-2">Select a Project</h3>
            <p className="text-muted-foreground mb-4">
              Please select a project to view and manage its tasks.
            </p>
            <div className="flex justify-center">
              <ProjectSelector />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground">
              Manage your tasks with drag-and-drop simplicity
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          {columns.map((column) => (
            <div key={column.id} className="flex-1 min-h-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <Skeleton className="h-5 w-8" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex-1">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground">
              Manage your tasks with drag-and-drop simplicity
            </p>
          </div>
        </div>
        <Card className="p-6 flex-1">
          <div className="text-center text-destructive">
            <p>Error loading tasks: {error?.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
            <p className="text-muted-foreground">
              Manage your tasks with drag-and-drop simplicity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProjectSelector />
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          {columns.map((column) => {
            const tasks = getTasksForColumn(column.status);
            return (
              <div key={column.id} className="flex-1 min-h-0">
                <DroppableColumn
                  column={column}
                  tasks={tasks}
                  showProjectName={isAllProjects}
                  updatingTaskIds={updatingTaskIds}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTaskFromColumn}
                  onTaskDelete={handleTaskDelete}
                />
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            showProjectName={isAllProjects}
            onTaskClick={handleTaskClick}
            onTaskDelete={handleTaskDelete}
          />
        ) : null}
      </DragOverlay>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        projectId={isAllProjects ? undefined : projectId}
      />
    </DndContext>
  );
}
