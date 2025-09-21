"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  Plus,
  MoreHorizontal,
  LogOut,
  User,
} from "lucide-react";
import { CreateTaskModal } from "./create-task-modal";
import { CreateProjectModal } from "./create-project-modal";
import { WorkspaceSelector } from "./workspace-selector";

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Projects",
    icon: FolderOpen,
    url: "/dashboard/projects",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    url: "/dashboard/tasks",
  },
  {
    title: "Team",
    icon: Users,
    url: "/dashboard/team",
  },
];

// We can define a list of colors to cycle through for the project dots
const projectColors = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

interface DashboardSidebarProps {
  children: React.ReactNode;
}

export function DashboardSidebar({
  children,
}: Readonly<DashboardSidebarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  // --- Get user and logout function from Zustand Auth Store ---
  const { user, logout } = useAuthStore();

  // --- Get current workspace from Zustand Workspace Store ---
  const { currentWorkspace, currentProject, setCurrentProject } =
    useWorkspaceStore();

  // --- Use the projects hook with current workspace ID ---
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useProjects(currentWorkspace?.id || "");

  const handleLogout = () => {
    logout();
    router.push("/login"); // Redirect to login page after logout
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarContent>
          {/* Workspace Selector */}
          <WorkspaceSelector />

          {/* Logo Section */}
          <SidebarGroup>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">ProjectFlow</span>
            </div>
          </SidebarGroup>

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/dashboard" &&
                      pathname.startsWith(item.url));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Projects Section - Now powered by React Query */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Projects</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsCreateProjectModalOpen(true)}
                disabled={!currentWorkspace}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {!currentWorkspace && (
                  <SidebarMenuItem className="text-muted-foreground text-sm px-4 py-2">
                    Select a workspace to view projects
                  </SidebarMenuItem>
                )}

                {currentWorkspace && isLoading && (
                  <SidebarMenuItem>Loading projects...</SidebarMenuItem>
                )}

                {currentWorkspace && isError && (
                  <SidebarMenuItem className="text-red-500">
                    Failed to load
                  </SidebarMenuItem>
                )}

                {currentWorkspace &&
                  !isLoading &&
                  !isError &&
                  projects?.length > 0 &&
                  projects.map((project, index) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        className={`flex items-center justify-between w-full cursor-pointer ${
                          currentProject?.id === project.id ? "bg-accent" : ""
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              projectColors[index % projectColors.length]
                            }`}
                          />
                          <span className="text-sm truncate">
                            {project.name}
                          </span>
                        </div>
                        {/* Use _count.tasks if available, otherwise fall back to tasks.length */}
                        <Badge variant="secondary" className="text-xs">
                          {project._count?.tasks ?? project.tasks?.length ?? 0}
                        </Badge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                {currentWorkspace &&
                  !isLoading &&
                  !isError &&
                  projects?.length === 0 && (
                    <SidebarMenuItem className="text-muted-foreground text-sm px-4 py-2">
                      No projects found
                    </SidebarMenuItem>
                  )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex items-center gap-2 w-full">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>
                        {user?.username?.substring(0, 2).toUpperCase() || ".."}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-xs truncate">
                      <span className="font-medium">{user?.username}</span>
                      <span className="text-muted-foreground truncate">
                        {user?.email}
                      </span>
                    </div>
                    <MoreHorizontal className="h-4 w-4 ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-hidden">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={
          currentProject?.id !== "all" ? currentProject?.id : undefined
        }
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />
    </SidebarProvider>
  );
}
