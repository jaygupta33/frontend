// Mock data for teams and workspace members

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "LEAD" | "DEVELOPER" | "DESIGNER" | "QA";
  avatar?: string;
  initials: string;
  joinDate: string;
  activeTasks: number;
  completedTasks: number;
  status: "ONLINE" | "AWAY" | "OFFLINE";
  department: string;
  title: string;
  location: string;
  timezone: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  color: string;
  memberCount: number;
  leadId: string;
  members: TeamMember[];
  projects: string[];
  createdAt: string;
  type: "DEVELOPMENT" | "DESIGN" | "MARKETING" | "QA" | "PRODUCT" | "SUPPORT";
  status: "ACTIVE" | "INACTIVE";
}

export const mockWorkspaceMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    role: "ADMIN",
    initials: "SW",
    joinDate: "Jan 2023",
    activeTasks: 8,
    completedTasks: 142,
    status: "ONLINE",
    department: "Engineering",
    title: "Engineering Manager",
    location: "San Francisco, CA",
    timezone: "PST",
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex.chen@company.com",
    role: "LEAD",
    initials: "AC",
    joinDate: "Mar 2023",
    activeTasks: 6,
    completedTasks: 98,
    status: "ONLINE",
    department: "Engineering",
    title: "Senior Frontend Developer",
    location: "New York, NY",
    timezone: "EST",
  },
  {
    id: "3",
    name: "Maya Patel",
    email: "maya.patel@company.com",
    role: "DESIGNER",
    initials: "MP",
    joinDate: "Feb 2023",
    activeTasks: 4,
    completedTasks: 76,
    status: "ONLINE",
    department: "Design",
    title: "Senior UX Designer",
    location: "Austin, TX",
    timezone: "CST",
  },
  {
    id: "4",
    name: "James Rodriguez",
    email: "james.rodriguez@company.com",
    role: "DEVELOPER",
    initials: "JR",
    joinDate: "Apr 2023",
    activeTasks: 5,
    completedTasks: 89,
    status: "AWAY",
    department: "Engineering",
    title: "Backend Developer",
    location: "Remote",
    timezone: "PST",
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "QA",
    initials: "ED",
    joinDate: "May 2023",
    activeTasks: 3,
    completedTasks: 67,
    status: "ONLINE",
    department: "Quality Assurance",
    title: "QA Engineer",
    location: "Seattle, WA",
    timezone: "PST",
  },
  {
    id: "6",
    name: "David Kim",
    email: "david.kim@company.com",
    role: "DEVELOPER",
    initials: "DK",
    joinDate: "Jun 2023",
    activeTasks: 7,
    completedTasks: 54,
    status: "ONLINE",
    department: "Engineering",
    title: "Full Stack Developer",
    location: "Los Angeles, CA",
    timezone: "PST",
  },
  {
    id: "7",
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    role: "DESIGNER",
    initials: "LT",
    joinDate: "Jul 2023",
    activeTasks: 4,
    completedTasks: 43,
    status: "OFFLINE",
    department: "Design",
    title: "UI Designer",
    location: "Chicago, IL",
    timezone: "CST",
  },
  {
    id: "8",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "MEMBER",
    initials: "MB",
    joinDate: "Aug 2023",
    activeTasks: 6,
    completedTasks: 38,
    status: "ONLINE",
    department: "Marketing",
    title: "Product Marketing Manager",
    location: "Boston, MA",
    timezone: "EST",
  },
  {
    id: "9",
    name: "Anna Garcia",
    email: "anna.garcia@company.com",
    role: "QA",
    initials: "AG",
    joinDate: "Sep 2023",
    activeTasks: 2,
    completedTasks: 29,
    status: "AWAY",
    department: "Quality Assurance",
    title: "QA Lead",
    location: "Miami, FL",
    timezone: "EST",
  },
  {
    id: "10",
    name: "Ryan Lee",
    email: "ryan.lee@company.com",
    role: "DEVELOPER",
    initials: "RL",
    joinDate: "Oct 2023",
    activeTasks: 5,
    completedTasks: 22,
    status: "ONLINE",
    department: "Engineering",
    title: "DevOps Engineer",
    location: "Denver, CO",
    timezone: "MST",
  },
];

export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Frontend Development",
    description: "Building amazing user interfaces and experiences",
    color: "#3B82F6",
    memberCount: 4,
    leadId: "2",
    members: [
      mockWorkspaceMembers[1], // Alex Chen
      mockWorkspaceMembers[5], // David Kim
      mockWorkspaceMembers[2], // Maya Patel
      mockWorkspaceMembers[6], // Lisa Thompson
    ],
    projects: ["Project Manager", "Mobile App", "Design System"],
    createdAt: "2023-03-15",
    type: "DEVELOPMENT",
    status: "ACTIVE",
  },
  {
    id: "team-2",
    name: "Backend Systems",
    description: "Scalable APIs and infrastructure solutions",
    color: "#10B981",
    memberCount: 3,
    leadId: "1",
    members: [
      mockWorkspaceMembers[0], // Sarah Wilson
      mockWorkspaceMembers[3], // James Rodriguez
      mockWorkspaceMembers[9], // Ryan Lee
    ],
    projects: ["API Gateway", "Microservices", "Database Migration"],
    createdAt: "2023-03-10",
    type: "DEVELOPMENT",
    status: "ACTIVE",
  },
  {
    id: "team-3",
    name: "Design Team",
    description: "Creating beautiful and intuitive user experiences",
    color: "#8B5CF6",
    memberCount: 2,
    leadId: "3",
    members: [
      mockWorkspaceMembers[2], // Maya Patel
      mockWorkspaceMembers[6], // Lisa Thompson
    ],
    projects: ["Design System", "Mobile App", "Website Redesign"],
    createdAt: "2023-02-20",
    type: "DESIGN",
    status: "ACTIVE",
  },
  {
    id: "team-4",
    name: "Quality Assurance",
    description: "Ensuring product quality and reliability",
    color: "#F59E0B",
    memberCount: 2,
    leadId: "9",
    members: [
      mockWorkspaceMembers[8], // Anna Garcia
      mockWorkspaceMembers[4], // Emily Davis
    ],
    projects: ["Automated Testing", "Quality Standards", "Bug Tracking"],
    createdAt: "2023-05-01",
    type: "QA",
    status: "ACTIVE",
  },
  {
    id: "team-5",
    name: "Product Marketing",
    description: "Driving product adoption and market success",
    color: "#EF4444",
    memberCount: 1,
    leadId: "8",
    members: [
      mockWorkspaceMembers[7], // Michael Brown
    ],
    projects: ["Go-to-Market", "User Research", "Content Strategy"],
    createdAt: "2023-08-15",
    type: "MARKETING",
    status: "ACTIVE",
  },
];

export const getTeamStats = () => {
  const totalMembers = mockWorkspaceMembers.length;
  const onlineMembers = mockWorkspaceMembers.filter(
    (m) => m.status === "ONLINE"
  ).length;
  const totalActiveTasks = mockWorkspaceMembers.reduce(
    (acc, member) => acc + member.activeTasks,
    0
  );
  const totalCompletedTasks = mockWorkspaceMembers.reduce(
    (acc, member) => acc + member.completedTasks,
    0
  );

  return {
    totalMembers,
    onlineMembers,
    totalActiveTasks,
    totalCompletedTasks,
    totalTeams: mockTeams.length,
    activeTeams: mockTeams.filter((team) => team.status === "ACTIVE").length,
  };
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "LEAD":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "DEVELOPER":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "DESIGNER":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    case "QA":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "MEMBER":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "AWAY":
      return "bg-yellow-500";
    case "OFFLINE":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};
