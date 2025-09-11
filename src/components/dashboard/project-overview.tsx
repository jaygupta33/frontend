"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  CheckSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Project, ProjectStatus, Priority } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// Mock team data - keeping as requested
const mockTeam = [
  { name: "Alice Johnson", initials: "AJ" },
  { name: "Bob Smith", initials: "BS" },
  { name: "Carol Davis", initials: "CD" },
];

function getStatusColor(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return "bg-chart-2 text-white";
    case ProjectStatus.COMPLETED:
      return "bg-chart-1 text-white";
    case ProjectStatus.ON_HOLD:
      return "bg-muted text-muted-foreground";
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

// Helper function to calculate project progress
function calculateProgress(project: Project) {
  if (!project.tasks || project.tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      progress: 0,
    };
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (task) => task.status === "DONE"
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    progress,
  };
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "No due date";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function ProjectCard({ project }: { readonly project: Project }) {
  const router = useRouter();
  const { totalTasks, completedTasks, progress } = calculateProgress(project);

  const handleViewProject = () => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description provided"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Add Member</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Archive Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.projectStatus)}>
            {project.projectStatus.replace("_", " ")}
          </Badge>
          <Badge
            variant="outline"
            className={getPriorityColor(project.priority)}
          >
            {project.priority} PRIORITY
          </Badge>
        </div>

        {/* Team and Due Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {/* Using mock team data as requested */}
              {mockTeam.slice(0, 3).map((member) => (
                <Avatar
                  key={member.name}
                  className="h-6 w-6 border-2 border-background"
                >
                  <AvatarFallback className="text-xs">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {mockTeam.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{mockTeam.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(project.dueDate)}
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleViewProject}
        >
          View Project
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function ProjectOverview() {
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || "cmf8ny6xw0000g0ickuojpqhj";

  const { data: projects = [], isLoading, isError } = useProjects(workspaceId);

  const activeProjects = projects.filter(
    (p) => p.projectStatus === ProjectStatus.ACTIVE
  );
  const completedProjects = projects.filter(
    (p) => p.projectStatus === ProjectStatus.COMPLETED
  );
  const onHoldProjects = projects.filter(
    (p) => p.projectStatus === ProjectStatus.ON_HOLD
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track progress across all your projects
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track progress across all your projects
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        <Card className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading projects. Please try again.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track progress across all your projects
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Clock className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* On Hold Projects */}
      {onHoldProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">On Hold Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {onHoldProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-muted-foreground">
                Get started by creating your first project
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
