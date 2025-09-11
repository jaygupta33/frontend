"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Project, Task } from "@/types";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";

interface ProjectSummaryProps {
  project: Project;
  tasks: Task[];
}

// Custom colors for the pie chart
const TASK_COLORS = {
  TODO: "#f59e0b", // amber
  IN_PROGRESS: "#3b82f6", // blue
  DONE: "#10b981", // green
};

// Activity mock data (since we don't have activity tracking yet)
const mockActivities = [
  {
    id: 1,
    type: "task_created",
    user: "John Doe",
    description: 'created task "Implement authentication"',
    timestamp: "2 hours ago",
    icon: CheckSquare,
  },
  {
    id: 2,
    type: "task_updated",
    user: "Jane Smith",
    description: 'moved "Setup database" to In Progress',
    timestamp: "4 hours ago",
    icon: TrendingUp,
  },
  {
    id: 3,
    type: "comment_added",
    user: "Mike Johnson",
    description: 'commented on "Design review"',
    timestamp: "6 hours ago",
    icon: MessageSquare,
  },
  {
    id: 4,
    type: "task_completed",
    user: "Sarah Wilson",
    description: 'completed task "Create wireframes"',
    timestamp: "1 day ago",
    icon: CheckSquare,
  },
];

export function ProjectSummary({ project, tasks }: ProjectSummaryProps) {
  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  // Calculate additional metrics
  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== "DONE";
  }).length;

  const dueSoonTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && t.status !== "DONE";
  }).length;

  // Data for pie chart
  const pieChartData = [
    { name: "To Do", value: taskStats.todo, color: TASK_COLORS.TODO },
    {
      name: "In Progress",
      value: taskStats.inProgress,
      color: TASK_COLORS.IN_PROGRESS,
    },
    { name: "Done", value: taskStats.done, color: TASK_COLORS.DONE },
  ].filter((item) => item.value > 0);

  // Data for activity chart (mock data for demonstration)
  const activityData = [
    { name: "Mon", tasks: 3, completed: 2 },
    { name: "Tue", tasks: 5, completed: 3 },
    { name: "Wed", tasks: 2, completed: 2 },
    { name: "Thu", tasks: 4, completed: 1 },
    { name: "Fri", tasks: 6, completed: 4 },
    { name: "Sat", tasks: 1, completed: 1 },
    { name: "Sun", tasks: 2, completed: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.done} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueSoonTasks}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueTasks}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm">To Do ({taskStats.todo})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">
                    In Progress ({taskStats.inProgress})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Done ({taskStats.done})</span>
                </div>
              </div>
              <div className="h-32 w-32">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">No tasks yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#e5e7eb" name="Total Tasks" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
