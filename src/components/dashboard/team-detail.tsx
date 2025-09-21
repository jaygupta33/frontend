"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreHorizontal,
  Mail,
  Calendar,
  CheckSquare,
  Clock,
  Users,
  Plus,
  Settings,
  Target,
  MapPin,
  Globe,
  UserPlus,
} from "lucide-react";
import {
  mockTeams,
  mockWorkspaceMembers,
  TeamMember,
  getRoleColor,
  getStatusColor,
} from "@/lib/mockData";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";

interface TeamDetailProps {
  teamId: string;
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(
                    member.status
                  )}`}
                />
              </div>
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.title}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Send Message</DropdownMenuItem>
                <DropdownMenuItem>Assign Task</DropdownMenuItem>
                {member.role !== "ADMIN" && (
                  <DropdownMenuItem className="text-destructive">
                    Remove from Team
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role and Department */}
          <div className="flex items-center justify-between">
            <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
            <span className="text-xs text-muted-foreground">
              {member.department}
            </span>
          </div>

          {/* Location and Timezone */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {member.location}
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {member.timezone}
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {member.activeTasks}
              </div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {member.completedTasks}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Joined {member.joinDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamDetail({ teamId }: TeamDetailProps) {
  const router = useRouter();

  const team = mockTeams.find((t) => t.id === teamId);

  if (!team) {
    notFound();
  }

  const teamLead = mockWorkspaceMembers.find(
    (member) => member.id === team.leadId
  );
  const onlineMembers = team.members.filter(
    (m) => m.status === "ONLINE"
  ).length;
  const totalActiveTasks = team.members.reduce(
    (acc, member) => acc + member.activeTasks,
    0
  );
  const totalCompletedTasks = team.members.reduce(
    (acc, member) => acc + member.completedTasks,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: team.color }}
          >
            {team.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              <Badge variant="outline">{team.type}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{team.description}</p>
            {teamLead && (
              <div className="flex items-center gap-2 mt-2">
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
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {onlineMembers} online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.projects.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveTasks}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedTasks}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {team.projects.map((project) => (
              <div
                key={project}
                className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="font-medium">{project}</div>
                <div className="text-sm text-muted-foreground">
                  {Math.floor(Math.random() * 15) + 5} tasks •{" "}
                  {Math.floor(Math.random() * 5) + 2} members
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <Badge variant="outline">{team.memberCount} members</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {team.members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
