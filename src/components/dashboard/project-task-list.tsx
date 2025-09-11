"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Flag,
  MessageSquare,
  Plus,
  ChevronDown,
  CheckSquare2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Task, TaskStatus, Priority } from "@/types";
import { TaskDetailModal } from "./task-detail-modal";
import { useDeleteTask } from "@/hooks";

// Priority and status helpers
function getPriorityColor(priority: Priority) {
  switch (priority) {
    case Priority.HIGH:
      return "text-red-600";
    case Priority.MEDIUM:
      return "text-yellow-600";
    case Priority.LOW:
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return (
        <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
      );
    case "IN_PROGRESS":
      return <Clock className="w-3 h-3 text-blue-500" />;
    case "DONE":
      return <CheckSquare2 className="w-3 h-3 text-green-500" />;
    default:
      return (
        <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>
      );
  }
}

function getStatusBadge(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          To Do
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="text-blue-600 border-blue-300 bg-blue-50"
        >
          In Progress
        </Badge>
      );
    case "DONE":
      return (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50"
        >
          Done
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-300">
          {status}
        </Badge>
      );
  }
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if overdue
    if (diffDays < 0) {
      return (
        <span className="text-red-600 font-medium">
          {Math.abs(diffDays)} days overdue
        </span>
      );
    }

    // Check if due soon
    if (diffDays <= 7) {
      return (
        <span className="text-amber-600 font-medium">
          {diffDays === 0 ? "Due today" : `${diffDays} days left`}
        </span>
      );
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateString;
  }
}

interface ProjectTaskListProps {
  tasks: Task[];
  isLoading: boolean;
  workspaceId: string;
  projectId: string;
}

export function ProjectTaskList({
  tasks,
  isLoading,
  workspaceId,
  projectId,
}: ProjectTaskListProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const deleteTaskMutation = useDeleteTask();

  // Filter and search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(task.status);
    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(task.priority);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle task selection
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map((task) => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Handle task deletion
  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate({
      workspaceId: workspaceId,
      projectId: task.projectId,
      taskId: task.id,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Task List</h3>
          <Badge variant="secondary">
            {filteredTasks.length} of {tasks.length} tasks
          </Badge>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Status
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("TODO" as TaskStatus)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "TODO" as TaskStatus]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "TODO"));
                    }
                  }}
                >
                  To Do
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("IN_PROGRESS" as TaskStatus)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([
                        ...statusFilter,
                        "IN_PROGRESS" as TaskStatus,
                      ]);
                    } else {
                      setStatusFilter(
                        statusFilter.filter((s) => s !== "IN_PROGRESS")
                      );
                    }
                  }}
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("DONE" as TaskStatus)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "DONE" as TaskStatus]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "DONE"));
                    }
                  }}
                >
                  Done
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Flag className="mr-2 h-4 w-4" />
                  Priority
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={priorityFilter.includes(Priority.HIGH)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPriorityFilter([...priorityFilter, Priority.HIGH]);
                    } else {
                      setPriorityFilter(
                        priorityFilter.filter((p) => p !== Priority.HIGH)
                      );
                    }
                  }}
                >
                  High Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter.includes(Priority.MEDIUM)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPriorityFilter([...priorityFilter, Priority.MEDIUM]);
                    } else {
                      setPriorityFilter(
                        priorityFilter.filter((p) => p !== Priority.MEDIUM)
                      );
                    }
                  }}
                >
                  Medium Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter.includes(Priority.LOW)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPriorityFilter([...priorityFilter, Priority.LOW]);
                    } else {
                      setPriorityFilter(
                        priorityFilter.filter((p) => p !== Priority.LOW)
                      );
                    }
                  }}
                >
                  Low Priority
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {statusFilter.length > 0 || priorityFilter.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter([]);
                  setPriorityFilter([]);
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Task Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTasks.size === filteredTasks.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTasks.has(task.id)}
                    onCheckedChange={(checked) =>
                      handleTaskSelect(task.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>{getStatusIcon(task.status)}</TableCell>
                <TableCell>
                  <div
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Flag
                      className={`h-3 w-3 ${getPriorityColor(task.priority)}`}
                    />
                    <span
                      className={`text-sm ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {task.assignee.username
                            ?.substring(0, 2)
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.username}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(task.dueDate)}
                  </div>
                </TableCell>
                <TableCell>
                  {task.comments && task.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {task.comments.length}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteTask(task)}
                        disabled={deleteTaskMutation.isPending}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <CheckSquare2 className="h-8 w-8" />
              <p>
                {searchQuery ||
                statusFilter.length > 0 ||
                priorityFilter.length > 0
                  ? "No tasks match your filters"
                  : "No tasks in this project yet"}
              </p>
              {searchQuery ||
              statusFilter.length > 0 ||
              priorityFilter.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter([]);
                    setPriorityFilter([]);
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </Card>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
