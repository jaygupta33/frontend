"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
}: {
  readonly task: Task;
  readonly isUpdating?: boolean;
  readonly onTaskClick: (task: Task) => void;
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
      <TaskCard task={task} isUpdating={isUpdating} onTaskClick={onTaskClick} />
    </div>
  );
}

function TaskCard({
  task,
  isUpdating = false,
  onTaskClick,
}: {
  readonly task: Task;
  readonly isUpdating?: boolean;
  readonly onTaskClick?: (task: Task) => void;
}) {
  const deleteTaskMutation = useDeleteTask();

  const handleDelete = () => {
    deleteTaskMutation.mutate({
      workspaceId: task.workspaceId || "cmf8ny6xw0000g0ickuojpqhj",
      projectId: task.projectId,
      taskId: task.id,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-dropdown-trigger]")) {
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
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
}: {
  readonly column: { id: string; title: string; status: TaskStatus };
  readonly tasks: Task[];
  readonly updatingTaskIds: Set<string>;
  readonly onTaskClick: (task: Task) => void;
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
}: ProjectTaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Use separate state to track if we should use optimistic or server tasks
  const [useOptimistic, setUseOptimistic] = useState(false);
  const displayTasks =
    useOptimistic && optimisticTasks.length > 0 ? optimisticTasks : tasks;

  // Update optimistic tasks when server data changes
  useEffect(() => {
    setUseOptimistic(false);
    if (tasks.length > 0) {
      setOptimisticTasks([...tasks]);
      hasInitializedRef.current = true;
    } else if (tasks.length === 0 && !isLoading && hasInitializedRef.current) {
      setOptimisticTasks([]);
    }
  }, [tasks, isLoading]);

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

    // Optimistically update the local tasks state immediately
    const updatedTasks = displayTasks.map((t: Task) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setOptimisticTasks(updatedTasks);
    setUseOptimistic(true);

    // Mark task as updating
    setUpdatingTaskIds((prev) => new Set(prev).add(taskId));

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
          setOptimisticTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
          );
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
        },
        onError: () => {
          setOptimisticTasks((prevTasks) =>
            prevTasks.map((t) => (t.id === taskId ? task : t))
          );
          setUpdatingTaskIds((prev) => {
            const next = new Set(prev);
            next.delete(taskId);
            return next;
          });
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
      <div className="flex flex-col md:flex-row gap-4 h-[600px]">
        {columns.map((column) => (
          <div key={column.id} className="flex-1">
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
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Task Board</h3>
          <Badge variant="secondary">{displayTasks.length} tasks</Badge>
        </div>
        <Button>
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
        <div className="flex flex-col md:flex-row gap-4 h-[600px]">
          {columns.map((column) => {
            const columnTasks = getTasksForColumn(column.status);
            return (
              <div key={column.id} className="flex-1">
                <DroppableColumn
                  column={column}
                  tasks={columnTasks}
                  updatingTaskIds={updatingTaskIds}
                  onTaskClick={handleTaskClick}
                />
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onTaskClick={handleTaskClick} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
