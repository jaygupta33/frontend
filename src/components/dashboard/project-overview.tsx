import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Project {
  id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate: string;
  team: {
    name: string;
    avatar?: string;
    initials: string;
  }[];
  priority: "LOW" | "MEDIUM" | "HIGH";
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description:
      "Complete overhaul of the company website with modern design and improved UX",
    status: "ACTIVE",
    progress: 75,
    totalTasks: 12,
    completedTasks: 9,
    dueDate: "Sep 15, 2025",
    team: [
      { name: "Alice Johnson", initials: "AJ" },
      { name: "Bob Smith", initials: "BS" },
      { name: "Carol Davis", initials: "CD" },
    ],
    priority: "HIGH",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile application for iOS and Android platforms",
    status: "ACTIVE",
    progress: 45,
    totalTasks: 8,
    completedTasks: 4,
    dueDate: "Sep 30, 2025",
    team: [
      { name: "David Wilson", initials: "DW" },
      { name: "Eve Brown", initials: "EB" },
    ],
    priority: "HIGH",
  },
  {
    id: "3",
    name: "API Development",
    description: "RESTful API development for microservices architecture",
    status: "ACTIVE",
    progress: 20,
    totalTasks: 15,
    completedTasks: 3,
    dueDate: "Oct 15, 2025",
    team: [
      { name: "Frank Miller", initials: "FM" },
      { name: "Grace Lee", initials: "GL" },
      { name: "Henry Zhang", initials: "HZ" },
    ],
    priority: "MEDIUM",
  },
  {
    id: "4",
    name: "Marketing Campaign",
    description: "Q4 marketing campaign for product launch",
    status: "COMPLETED",
    progress: 100,
    totalTasks: 6,
    completedTasks: 6,
    dueDate: "Aug 30, 2025",
    team: [
      { name: "Ivy Cooper", initials: "IC" },
      { name: "Jack Turner", initials: "JT" },
    ],
    priority: "LOW",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-chart-2 text-white";
    case "COMPLETED":
      return "bg-chart-1 text-white";
    case "ON_HOLD":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

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

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
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
            <span className="text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {project.completedTasks} of {project.totalTasks} tasks completed
            </span>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace("_", " ")}
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
              {project.team.slice(0, 3).map((member) => (
                <Avatar
                  key={member.name}
                  className="h-6 w-6 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{project.team.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {project.dueDate}
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" className="w-full">
          View Project
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function ProjectOverview() {
  const activeProjects = mockProjects.filter((p) => p.status === "ACTIVE");
  const completedProjects = mockProjects.filter(
    (p) => p.status === "COMPLETED"
  );

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
            <div className="text-2xl font-bold">{mockProjects.length}</div>
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
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Projects</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

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
    </div>
  );
}
