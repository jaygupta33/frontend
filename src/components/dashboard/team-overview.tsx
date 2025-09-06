import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Mail,
  Calendar,
  CheckSquare,
  Clock,
  Users,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MEMBER"
  avatar?: string
  initials: string
  joinDate: string
  activeTasks: number
  completedTasks: number
  status: "ONLINE" | "AWAY" | "OFFLINE"
  workspaces: string[]
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@company.com",
    role: "ADMIN",
    initials: "AJ",
    joinDate: "Jan 2024",
    activeTasks: 5,
    completedTasks: 23,
    status: "ONLINE",
    workspaces: ["Design Team", "Marketing"],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@company.com",
    role: "MEMBER",
    initials: "BS",
    joinDate: "Feb 2024",
    activeTasks: 3,
    completedTasks: 18,
    status: "ONLINE",
    workspaces: ["Development", "API Team"],
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@company.com",
    role: "MEMBER",
    initials: "CD",
    joinDate: "Mar 2024",
    activeTasks: 4,
    completedTasks: 15,
    status: "AWAY",
    workspaces: ["Development", "DevOps"],
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@company.com",
    role: "MEMBER",
    initials: "DW",
    joinDate: "Apr 2024",
    activeTasks: 2,
    completedTasks: 12,
    status: "OFFLINE",
    workspaces: ["API Team"],
  },
  {
    id: "5",
    name: "Eve Brown",
    email: "eve@company.com",
    role: "ADMIN",
    initials: "EB",
    joinDate: "May 2024",
    activeTasks: 6,
    completedTasks: 20,
    status: "ONLINE",
    workspaces: ["Design Team", "Development"],
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "ONLINE":
      return "bg-chart-1"
    case "AWAY":
      return "bg-chart-4"
    case "OFFLINE":
      return "bg-muted"
    default:
      return "bg-muted"
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-primary text-primary-foreground"
    case "MEMBER":
      return "bg-secondary text-secondary-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
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
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
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

          {/* Role and Join Date */}
          <div className="flex items-center justify-between">
            <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {member.joinDate}
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2">{member.activeTasks}</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-1">{member.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Workspaces */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Workspaces</div>
            <div className="flex flex-wrap gap-1">
              {member.workspaces.map((workspace) => (
                <Badge key={workspace} variant="outline" className="text-xs">
                  {workspace}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamOverview() {
  const onlineMembers = mockTeamMembers.filter(m => m.status === "ONLINE").length
  const totalTasks = mockTeamMembers.reduce((acc, member) => acc + member.activeTasks, 0)
  const totalCompleted = mockTeamMembers.reduce((acc, member) => acc + member.completedTasks, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage team members and track their contributions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <div className="h-2 w-2 rounded-full bg-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTeamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  )
}
