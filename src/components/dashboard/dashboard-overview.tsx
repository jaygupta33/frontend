import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

const stats = [
  {
    title: "Total Tasks",
    value: "35",
    change: "+12%",
    trend: "up",
    icon: CheckSquare,
    color: "text-chart-1",
  },
  {
    title: "In Progress",
    value: "12",
    change: "+3",
    trend: "up",
    icon: Clock,
    color: "text-chart-2",
  },
  {
    title: "Team Members",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Users,
    color: "text-chart-3",
  },
  {
    title: "Completion Rate",
    value: "68%",
    change: "+5%",
    trend: "up",
    icon: TrendingUp,
    color: "text-chart-4",
  },
]

const recentTasks = [
  {
    id: "1",
    title: "Design new landing page",
    project: "Website Redesign",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: "Alice Johnson",
    dueDate: "2025-09-08",
  },
  {
    id: "2",
    title: "Implement user authentication",
    project: "Mobile App",
    status: "TODO",
    priority: "HIGH",
    assignee: "Bob Smith",
    dueDate: "2025-09-10",
  },
  {
    id: "3",
    title: "Write API documentation",
    project: "API Development",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignee: "Carol Davis",
    dueDate: "2025-09-12",
  },
  {
    id: "4",
    title: "Set up testing environment",
    project: "Website Redesign",
    status: "DONE",
    priority: "LOW",
    assignee: "David Wilson",
    dueDate: "2025-09-05",
  },
]

const upcomingDeadlines = [
  {
    task: "User interface mockups",
    project: "Mobile App",
    dueDate: "Today",
    priority: "HIGH",
  },
  {
    task: "Database schema design",
    project: "API Development",
    dueDate: "Tomorrow",
    priority: "HIGH",
  },
  {
    task: "Content review",
    project: "Website Redesign",
    dueDate: "Sep 8",
    priority: "MEDIUM",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "TODO":
      return "bg-muted text-muted-foreground"
    case "IN_PROGRESS":
      return "bg-chart-2 text-white"
    case "DONE":
      return "bg-chart-1 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-destructive text-destructive-foreground"
    case "MEDIUM":
      return "bg-chart-4 text-white"
    case "LOW":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-1">↗ {stat.change}</span> from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{task.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{task.project}</span>
                      <span>•</span>
                      <span>{task.assignee}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((item) => (
                <div
                  key={`${item.task}-${item.project}`}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{item.task}</p>
                    <p className="text-sm text-muted-foreground">{item.project}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.dueDate}</p>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(item.priority)}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    {item.dueDate === "Today" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Website Redesign</span>
                <span className="text-muted-foreground">75% Complete</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>9 of 12 tasks completed</span>
                <span>Due: Sep 15</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Mobile App</span>
                <span className="text-muted-foreground">45% Complete</span>
              </div>
              <Progress value={45} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>4 of 8 tasks completed</span>
                <span>Due: Sep 30</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">API Development</span>
                <span className="text-muted-foreground">20% Complete</span>
              </div>
              <Progress value={20} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>3 of 15 tasks completed</span>
                <span>Due: Oct 15</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
