"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useAllTasksInWorkspace } from "@/hooks/useTasks";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { ProjectSummary } from "@/components/dashboard/project-summary";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";
import { ProjectTaskList } from "@/components/dashboard/project-task-list";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { currentWorkspace } = useWorkspaceStore();

  const { data: projects = [], isLoading: projectsLoading } = useProjects(
    currentWorkspace?.id || ""
  );
  const { data: tasks = [], isLoading: tasksLoading } = useAllTasksInWorkspace(
    currentWorkspace?.id || ""
  );

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const [activeTab, setActiveTab] = useState("summary");

  if (projectsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
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

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">Project not found</h3>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have
              access to it.
            </p>
          </div>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header - Jira inspired */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    let statusClass;
                    if (project.projectStatus === "ACTIVE") {
                      statusClass =
                        "bg-green-100 text-green-800 hover:bg-green-100";
                    } else if (project.projectStatus === "COMPLETED") {
                      statusClass =
                        "bg-blue-100 text-blue-800 hover:bg-blue-100";
                    } else {
                      statusClass =
                        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
                    }

                    return (
                      <Badge variant="secondary" className={statusClass}>
                        {project.projectStatus.replace("_", " ")}
                      </Badge>
                    );
                  })()}
                  <Badge variant="outline" className="text-xs">
                    {project.priority} PRIORITY
                  </Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {project.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Project settings
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Jira style */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto p-0 bg-transparent border-b rounded-none w-full justify-start">
          <TabsTrigger
            value="summary"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="taskboard"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Task Board
          </TabsTrigger>
          <TabsTrigger
            value="tasklist"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Task List
          </TabsTrigger>
          <TabsTrigger
            value="timelog"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Time Log
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Code
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 py-3 font-medium transition-colors hover:text-primary/80"
          >
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <ProjectSummary project={project} tasks={projectTasks} />
        </TabsContent>

        <TabsContent
          value="taskboard"
          className="mt-6 h-[calc(100vh-300px)] min-h-[600px]"
        >
          <ProjectTaskBoard
            tasks={projectTasks}
            isLoading={tasksLoading}
            workspaceId={currentWorkspace?.id || ""}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="tasklist" className="mt-6">
          <ProjectTaskList
            tasks={projectTasks}
            isLoading={tasksLoading}
            workspaceId={currentWorkspace?.id || ""}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="timelog" className="mt-6">
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Time Log</h3>
              <p>
                Time tracking and logging functionality will be implemented here
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Code</h3>
              <p>Code repository integration will be implemented here</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Documents</h3>
              <p>Document management and sharing will be implemented here</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
