"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MoreHorizontal,
  Mail,
  Calendar,
  CheckSquare,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Globe,
  Building2,
  UserCheck,
} from "lucide-react";
import {
  mockWorkspaceMembers,
  getTeamStats,
  getRoleColor,
  getStatusColor,
  TeamMember,
} from "@/lib/mockData";
import { useRouter } from "next/navigation";
import { useState } from "react";

function WorkspaceMemberCard({ member }: { member: TeamMember }) {
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
                <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                <DropdownMenuItem>Assign Task</DropdownMenuItem>
                {member.role !== "ADMIN" && (
                  <DropdownMenuItem className="text-destructive">
                    Remove from Workspace
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role and Department */}
          <div className="flex items-center justify-between">
            <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {member.department}
            </span>
          </div>

          {/* Location and Timezone */}
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
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
              <div className="text-xl font-bold text-blue-600">
                {member.activeTasks}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {member.completedTasks}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {member.joinDate}
            </div>
            <Badge variant="outline" className="text-xs">
              {member.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceMembersView() {
  const router = useRouter();
  const stats = getTeamStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Filter members based on search and filters
  const filteredMembers = mockWorkspaceMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(
    new Set(mockWorkspaceMembers.map((m) => m.department))
  );
  const roles = Array.from(new Set(mockWorkspaceMembers.map((m) => m.role)));

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
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Users className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Workspace Members
            </h1>
            <p className="text-muted-foreground mt-1">
              All members across your workspace and teams
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalTeams} teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onlineMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.onlineMembers / stats.totalMembers) * 100)}%
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveTasks}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.totalActiveTasks / stats.totalMembers).toFixed(1)} per
              member
            </p>
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
            <div className="text-2xl font-bold">
              {stats.totalCompletedTasks}
            </div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="AWAY">Away</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Members</h2>
          <Badge variant="outline">
            {filteredMembers.length} of {mockWorkspaceMembers.length} members
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <WorkspaceMemberCard key={member.id} member={member} />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No members found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find the members you're
                looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                  setDepartmentFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
