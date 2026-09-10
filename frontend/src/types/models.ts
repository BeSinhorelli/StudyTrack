export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

// ─── Enums (union types) ────────────────────────────
export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// ─── Entidades ──────────────────────────────────────
export type Subject = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudySession = {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string | null;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  notes: string | null;
  createdAt: string;
  subject?: Pick<Subject, 'id' | 'name' | 'color'>;
};

export type Goal = {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  targetHours: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  hoursStudied: number;
  progressPercent: number;
  completed: boolean;
};

export type Note = {
  id: string;
  userId: string;
  subjectId: string | null;
  topicId: string | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type StudyPlan = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Dashboard ──────────────────────────────────────
export type DashboardSummary = {
  hoursToday: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeGoals: number;
  currentStreak: number;
};

export type DashboardCharts = {
  byDay: { date: string; hours: number }[];
  bySubject: { subjectId: string; name: string; color: string; hours: number }[];
};

export type DashboardStats = {
  totalHours: number;
  totalSessions: number;
  averagePerSession: number;
  longestSession: number;
  mostStudiedSubject: { id: string; name: string; color: string } | null;
  mostProductiveDay: { date: string; hours: number } | null;
  currentStreak: number;
};