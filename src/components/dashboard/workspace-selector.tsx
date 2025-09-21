"use client";

import { useState, useEffect } from "react";
import { useWorkspaces, useCreateWorkspace } from "@/hooks/useWorkspaces";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, Building2, Check, Loader2 } from "lucide-react";
import { Workspace } from "@/types";

export function WorkspaceSelector() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const { user } = useAuthStore();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { data: workspaces = [], isLoading, refetch } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  // Helper function for workspace count text
  const getWorkspaceCountText = () => {
    if (isLoading) return "...";
    const count = workspaces.length;
    return `${count} workspace${count !== 1 ? "s" : ""}`;
  };

  // Auto-select first workspace if none is selected and workspaces are available
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  // Clear current workspace when user changes to ensure fresh state
  useEffect(() => {
    if (user) {
      setCurrentWorkspace(null);
    }
  }, [user?.id, setCurrentWorkspace]);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const newWorkspace = await createWorkspaceMutation.mutateAsync(
        newWorkspaceName.trim()
      );
      setCurrentWorkspace(newWorkspace);
      setNewWorkspaceName("");
      setIsCreateModalOpen(false);
      // Refetch workspaces to ensure UI is up to date
      refetch();
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateWorkspace();
    }
  };

  return (
    <div className="px-4 py-2 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {isLoading
                    ? "Loading..."
                    : currentWorkspace?.name || "Select Workspace"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getWorkspaceCountText()}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading workspaces...
            </DropdownMenuItem>
          ) : null}

          {!isLoading &&
            workspaces.length > 0 &&
            workspaces.map((workspace: Workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{workspace.name}</span>
                </div>
                {currentWorkspace?.id === workspace.id && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}

          {!isLoading && workspaces.length === 0 && (
            <DropdownMenuItem disabled>No workspaces found</DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace to organize your projects and
                  collaborate with your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="workspace-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter workspace name"
                    className="col-span-3"
                    disabled={createWorkspaceMutation.isPending}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewWorkspaceName("");
                  }}
                  disabled={createWorkspaceMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={
                    !newWorkspaceName.trim() ||
                    createWorkspaceMutation.isPending
                  }
                >
                  {createWorkspaceMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
