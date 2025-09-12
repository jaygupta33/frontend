"use client";

import { useState, useEffect, useRef } from "react";
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
import { useDeleteTask, useUpdateTask } from "@/hooks";
import { Task, TaskStatus } from "@/types";
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
  isUpdating = false,
  onTaskClick,
  workspaceId,
  projectId,
}: {
  readonly task: Task;
  readonly isUpdating?: boolean;
  readonly onTaskClick: (task: Task) => void;
  readonly workspaceId: string;
  readonly projectId: string;
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
        isUpdating={isUpdating}
        onTaskClick={onTaskClick}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
}

function TaskCard({
  task,
  isUpdating = false,
  onTaskClick,
  workspaceId,
  projectId,
}: {
  readonly task: Task;
  readonly isUpdating?: boolean;
  readonly onTaskClick?: (task: Task) => void;
  readonly workspaceId: string;
  readonly projectId: string;
}) {
  const deleteTaskMutation = useDeleteTask();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    // Show confirmation dialog for delete action
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    deleteTaskMutation.mutate(
      {
        workspaceId,
        projectId,
        taskId: task.id,
      },
      {
        onSuccess: () => {
          // Force close any modal that might be showing this task
          if (window) {
            const event = new CustomEvent("task-deleted", {
              detail: { taskId: task.id },
            });
            window.dispatchEvent(event);
          }
        },
        onError: (error) => {
          console.error("Failed to delete task:", error);
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
  updatingTaskIds,
  onTaskClick,
  workspaceId,
  projectId,
}: {
  readonly column: { id: string; title: string; status: TaskStatus };
  readonly tasks: Task[];
  readonly updatingTaskIds: Set<string>;
  readonly onTaskClick: (task: Task) => void;
  readonly workspaceId: string;
  readonly projectId: string;
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
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
                  isUpdating={updatingTaskIds.has(task.id)}
                  onTaskClick={onTaskClick}
                  workspaceId={workspaceId}
                  projectId={projectId}
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

interface ProjectTaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  workspaceId: string;
  projectId: string;
}

export function ProjectTaskBoard({
  tasks,
  isLoading,
  workspaceId,
  projectId,
}: Readonly<ProjectTaskBoardProps>) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const hasInitializedRef = useRef(false);
  const updateTaskMutation = useUpdateTask();

  // Handle task click to open modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Listen for task deletion events to close modals
  useEffect(() => {
    const handleTaskDeleted = (event: CustomEvent) => {
      if (selectedTask && selectedTask.id === event.detail.taskId) {
        setIsModalOpen(false);
        setSelectedTask(null);
      }
    };

    window.addEventListener("task-deleted", handleTaskDeleted as EventListener);
    return () => {
      window.removeEventListener(
        "task-deleted",
        handleTaskDeleted as EventListener
      );
    };
  }, [selectedTask]);

  // Use separate state to track if we should use optimistic or server tasks
  const [useOptimistic, setUseOptimistic] = useState(false);
  const displayTasks =
    useOptimistic && optimisticTasks.length > 0 ? optimisticTasks : tasks;

  // Update optimistic tasks when server data changes
  useEffect(() => {
    // Only update if we're not in optimistic mode or if this is initial data
    if (!useOptimistic || !hasInitializedRef.current) {
      if (tasks.length > 0) {
        setOptimisticTasks([...tasks]);
        hasInitializedRef.current = true;
        setUseOptimistic(false);
      } else if (
        tasks.length === 0 &&
        !isLoading &&
        hasInitializedRef.current
      ) {
        setOptimisticTasks([]);
        setUseOptimistic(false);
      }
    }
  }, [tasks, isLoading, useOptimistic]);

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

    const overId = over.id as string;

    if (columns.some((col) => col.id === overId)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = displayTasks.find((task: Task) => task.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      } else {
        setActiveTask(null);
        return;
      }
    }

    const task = displayTasks.find((t: Task) => t.id === taskId);

    if (!task || task.status === newStatus) {
      setActiveTask(null);
      return;
    }

    // Store original task state for rollback
    const originalTask = { ...task };

    // Optimistically update the local tasks state immediately
    const updatedTasks = displayTasks.map((t: Task) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setOptimisticTasks(updatedTasks);
    setUseOptimistic(true);

    // Mark task as updating
    setUpdatingTaskIds((prev) => new Set(prev).add(taskId));

    // Helper function to update task in list
    const updateTaskInList = (
      tasks: Task[],
      targetId: string,
      updatedTask: Task
    ) => tasks.map((t) => (t.id === targetId ? updatedTask : t));

    // Update the task status via API
    updateTaskMutation.mutate(
      {
        workspaceId,
        projectId: task.projectId,
        taskId,
        updates: { status: newStatus },
      },
      {
        onSuccess: (updatedTask) => {
          // Keep optimistic state until server data refreshes
          setOptimisticTasks((prevTasks) =>
            updateTaskInList(prevTasks, taskId, updatedTask)
          );
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        },
        onError: () => {
          // Rollback on error
          setOptimisticTasks((prevTasks) =>
            updateTaskInList(prevTasks, taskId, originalTask)
          );
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
          alert("Failed to update task status. Please try again.");
        },
      }
    );

    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const overId = over.id;
    if (columns.some((col) => col.id === overId)) {
      return;
    }

    const overTask = displayTasks.find((task: Task) => task.id === overId);
    if (overTask) {
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium">Task Board</h3>
            <Badge variant="secondary">Loading...</Badge>
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

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Task Board</h3>
          <Badge variant="secondary">{displayTasks.length} tasks</Badge>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.status);
            return (
              <div key={column.id} className="flex-1 min-h-0">
                <DroppableColumn
                  column={column}
                  tasks={columnTasks}
                  updatingTaskIds={updatingTaskIds}
                  onTaskClick={handleTaskClick}
                  workspaceId={workspaceId}
                  projectId={projectId}
                />
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onTaskClick={handleTaskClick}
              workspaceId={workspaceId}
              projectId={projectId}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
