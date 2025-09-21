"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  ArrowRight,
  Clock,
  CheckSquare,
  Globe,
  UserCheck,
  Building2,
  Target,
} from "lucide-react";
import {
  mockTeams,
  mockWorkspaceMembers,
  getTeamStats,
  Team,
} from "@/lib/mockData";
import { useRouter } from "next/navigation";

function TeamCard({ team }: { team: Team }) {
  const router = useRouter();

  const teamLead = mockWorkspaceMembers.find(
    (member) => member.id === team.leadId
  );
  const onlineMembers = team.members.filter(
    (member) => member.status === "ONLINE"
  ).length;

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4"
      style={{ borderLeftColor: team.color }}
      onClick={() => router.push(`/dashboard/team/${team.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: team.color }}
            >
              {team.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {team.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {team.description}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {team.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Team Lead */}
        {teamLead && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {teamLead.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Led by{" "}
              <span className="font-medium text-foreground">
                {teamLead.name}
              </span>
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm">{onlineMembers} online</span>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            ACTIVE PROJECTS
          </div>
          <div className="flex flex-wrap gap-1">
            {team.projects.slice(0, 2).map((project) => (
              <Badge key={project} variant="secondary" className="text-xs">
                {project}
              </Badge>
            ))}
            {team.projects.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{team.projects.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkspaceMembersCard() {
  const router = useRouter();
  const stats = getTeamStats();

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-primary"
      onClick={() => router.push("/dashboard/team/workspace-members")}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                All Workspace Members
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all workspace members
              </p>
            </div>
          </div>
          <Badge variant="default" className="text-xs">
            WORKSPACE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{stats.totalMembers} total members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm">{stats.onlineMembers} online</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">
              {stats.totalActiveTasks}
            </div>
            <div className="text-xs text-muted-foreground">Active Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {stats.totalCompletedTasks}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Across {stats.totalTeams} teams
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamsOverview() {
  const stats = getTeamStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Organize your workspace into focused teams for better collaboration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Workspace Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTeams} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineMembers} online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveTasks}</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCompletedTasks}
            </div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Teams</h2>
          <Badge variant="outline">{mockTeams.length} teams</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Workspace Members Card */}
          <WorkspaceMembersCard />

          {/* Team Cards */}
          {mockTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
