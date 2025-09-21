"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { useProjects } from "@/hooks";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Project, Priority, ProjectStatus } from "@/types";

interface ProjectSelectorProps {
  readonly onProjectSelect?: (project: Project) => void;
}

export function ProjectSelector({ onProjectSelect }: ProjectSelectorProps) {
  const { currentWorkspace, currentProject, setCurrentProject } =
    useWorkspaceStore();

  const { data: projects = [], isLoading } = useProjects(
    currentWorkspace?.id || ""
  );

  const handleSelect = (value: string) => {
    if (value === "all") {
      // Create a special "All Projects" project object
      const allProjectsOption: Project = {
        id: "all",
        name: "All Projects",
        workspaceId: currentWorkspace?.id || "",
        tasks: [],
        priority: Priority.MEDIUM,
        projectStatus: ProjectStatus.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      setCurrentProject(allProjectsOption);
      onProjectSelect?.(allProjectsOption);
    } else {
      const project = projects.find((p) => p.id === value);
      if (project) {
        setCurrentProject(project);
        onProjectSelect?.(project);
      }
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-[300px] justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span>Loading projects...</span>
        </div>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <FolderOpen className="h-4 w-4 text-muted-foreground" />
      <Select value={currentProject?.id || ""} onValueChange={handleSelect}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">All Projects</span>
              <Badge variant="secondary" className="text-xs ml-2">
                {projects.reduce(
                  (total, project) => total + (project._count?.tasks ?? 0),
                  0
                )}
              </Badge>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <span>{project.name}</span>
                <Badge variant="secondary" className="text-xs ml-2">
                  {project._count?.tasks ?? 0}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
