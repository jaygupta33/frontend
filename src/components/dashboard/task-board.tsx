import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  Flag,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  assignee?: {
    name: string
    avatar?: string
    initials: string
  }
  dueDate?: string
  comments: number
  attachments: number
  project: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design user interface mockups",
    description: "Create wireframes and mockups for the new user interface",
    status: "TODO",
    priority: "HIGH",
    assignee: {
      name: "Alice Johnson",
      initials: "AJ",
    },
    dueDate: "Sep 8",
    comments: 3,
    attachments: 2,
    project: "Mobile App",
  },
  {
    id: "2",
    title: "Implement authentication system",
    status: "TODO",
    priority: "MEDIUM",
    assignee: {
      name: "Bob Smith",
      initials: "BS",
    },
    dueDate: "Sep 10",
    comments: 1,
    attachments: 0,
    project: "API Development",
  },
  {
    id: "3",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: {
      name: "Carol Davis",
      initials: "CD",
    },
    dueDate: "Sep 9",
    comments: 5,
    attachments: 1,
    project: "Website Redesign",
  },
  {
    id: "4",
    title: "Write API documentation",
    status: "IN_PROGRESS",
    priority: "LOW",
    assignee: {
      name: "David Wilson",
      initials: "DW",
    },
    comments: 2,
    attachments: 3,
    project: "API Development",
  },
  {
    id: "5",
    title: "Code review and optimization",
    status: "DONE",
    priority: "MEDIUM",
    assignee: {
      name: "Eve Brown",
      initials: "EB",
    },
    comments: 8,
    attachments: 0,
    project: "Website Redesign",
  },
  {
    id: "6",
    title: "User testing and feedback",
    status: "DONE",
    priority: "HIGH",
    assignee: {
      name: "Frank Miller",
      initials: "FM",
    },
    comments: 12,
    attachments: 4,
    project: "Mobile App",
  },
]

const columns = [
  { id: "TODO", title: "To Do", status: "TODO" as const },
  { id: "IN_PROGRESS", title: "In Progress", status: "IN_PROGRESS" as const },
  { id: "DONE", title: "Done", status: "DONE" as const },
]

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

function getPriorityIcon(priority: string) {
  let color = "text-muted-foreground"
  if (priority === "HIGH") {
    color = "text-destructive"
  } else if (priority === "MEDIUM") {
    color = "text-chart-4"
  }
  return <Flag className={`h-3 w-3 ${color}`} />
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getPriorityIcon(task.priority)}
              <span className="text-xs text-muted-foreground">{task.project}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title and Description */}
          <div>
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
              )}
              
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.comments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments}
                </div>
              )}
              {task.attachments > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments}
                </div>
              )}
            </div>
          </div>

          {/* Priority Badge */}
          <div className="flex justify-end">
            <Badge
              variant="secondary"
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TaskBoard() {
  const getTasksForColumn = (status: typeof columns[0]["status"]) => {
    return mockTasks.filter((task) => task.status === status)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">
            Manage your tasks with drag-and-drop simplicity
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const tasks = getTasksForColumn(column.status)
          return (
            <div key={column.id} className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {column.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tasks.length}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No tasks</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
