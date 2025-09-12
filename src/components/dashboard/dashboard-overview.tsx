"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAllTasksInWorkspace } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { TaskStatus, Priority } from "@/types";
import { useMemo, useEffect } from "react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function calculateDaysUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getStatusColor(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO:
      return "bg-muted text-muted-foreground";
    case TaskStatus.IN_PROGRESS:
      return "bg-chart-2 text-white";
    case TaskStatus.DONE:
      return "bg-chart-1 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPriorityColor(priority: Priority) {
  switch (priority) {
    case Priority.HIGH:
      return "bg-destructive text-destructive-foreground";
    case Priority.MEDIUM:
      return "bg-chart-4 text-white";
    case Priority.LOW:
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  // Fetch workspaces first
  const { data: workspaces = [], isLoading: workspacesLoading } =
    useWorkspaces();

  // Auto-select first workspace if none is selected
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      console.log("Auto-selecting first workspace:", workspaces[0]);
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  // Fetch data using hooks
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useAllTasksInWorkspace(
    currentWorkspace?.id || "",
    !!currentWorkspace?.id
  );

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects(currentWorkspace?.id || "");

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS
    ).length;
    const completedTasks = tasks.filter(
      (task) => task.status === TaskStatus.DONE
    ).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return [
      {
        title: "Total Tasks",
        value: totalTasks.toString(),
        change: "+12%", // Mock percentage change
        trend: "up",
        icon: CheckSquare,
        color: "text-chart-1",
      },
      {
        title: "In Progress",
        value: inProgressTasks.toString(),
        change: `+${Math.max(1, Math.floor(inProgressTasks * 0.2))}`, // Mock change
        trend: "up",
        icon: Clock,
        color: "text-chart-2",
      },
      {
        title: "Team Members",
        value: "8", // TODO: Replace with actual team member count
        change: "+2", // Mock change
        trend: "up",
        icon: Users,
        color: "text-chart-3",
      },
      {
        title: "Completion Rate",
        value: `${completionRate}%`,
        change: "+5%", // Mock change
        trend: "up",
        icon: TrendingUp,
        color: "text-chart-4",
      },
    ];
  }, [tasks]);

  // Get recent tasks (last 4 tasks)
  const recentTasks = useMemo(() => {
    const sortedTasks = [...tasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedTasks.slice(0, 4);
  }, [tasks]);

  // Get upcoming deadlines (tasks due soon)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return (
          dueDate >= today &&
          dueDate <= nextWeek &&
          task.status !== TaskStatus.DONE
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      )
      .slice(0, 3)
      .map((task) => ({
        task: task.title,
        project: task.projectName || "Unknown Project",
        dueDate: formatDate(task.dueDate!),
        priority: task.priority,
      }));
  }, [tasks]);

  // Calculate project progress
  const projectProgress = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id
      );
      const completedTasks = projectTasks.filter(
        (task) => task.status === TaskStatus.DONE
      );
      const progress =
        projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;

      return {
        name: project.name,
        progress,
        completedTasks: completedTasks.length,
        totalTasks: projectTasks.length,
        dueDate: project.dueDate ? formatDate(project.dueDate) : "No due date",
      };
    });
  }, [projects, tasks]);

  if (workspacesLoading || tasksLoading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            "total-tasks",
            "in-progress",
            "team-members",
            "completion-rate",
          ].map((skeletonId) => (
            <Card key={`skeleton-${skeletonId}`}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show message if no workspaces exist
  if (workspaces.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Get started by creating your first workspace.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                No Workspaces Found
              </h3>
              <p className="text-muted-foreground mb-4">
                You need to create a workspace to start managing your projects
                and tasks.
              </p>
              <Button>Create Workspace</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.username || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in <strong>{currentWorkspace?.name}</strong>{" "}
          today.
        </p>
        {tasksError && (
          <p className="text-sm text-destructive">
            Error loading tasks: {tasksError.message}
          </p>
        )}
        {projectsError && (
          <p className="text-sm text-destructive">
            Error loading projects: {projectsError.message}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-1">↗ {stat.change}</span> from last
                week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{task.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{task.projectName || "No Project"}</span>
                        <span>•</span>
                        <span>{task.assignee?.username || "Unassigned"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks found. Create your first task to get started!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((item, index) => (
                  <div
                    key={`${item.task}-${item.project}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{item.task}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.project}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.dueDate}</p>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(item.priority)}
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      {item.dueDate === "Today" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming deadlines in the next week.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projectProgress.length > 0 ? (
              projectProgress.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.progress}% Complete
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {project.completedTasks} of {project.totalTasks} tasks
                      completed
                    </span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No projects found. Create your first project to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
