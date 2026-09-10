import { prisma } from '../config/prisma.js';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function toHours(minutes: number): number {
  return Number((minutes / 60).toFixed(2));
}

export const dashboardService = {
  async summary(userId: string) {
    const now = new Date();

    const [todaySessions, weekSessions, monthSessions, tasks, goals] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId, startedAt: { gte: startOfDay(now), lte: endOfDay(now) } },
        select: { durationMinutes: true },
      }),
      prisma.studySession.findMany({
        where: { userId, startedAt: { gte: startOfWeek(now) } },
        select: { durationMinutes: true },
      }),
      prisma.studySession.findMany({
        where: { userId, startedAt: { gte: startOfMonth(now) } },
        select: { durationMinutes: true },
      }),
      prisma.task.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId, deadline: { gte: now } } }),
    ]);

    const sum = (arr: { durationMinutes: number }[]) =>
      arr.reduce((acc, s) => acc + s.durationMinutes, 0);

    const pendingTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate < now &&
        t.status !== 'COMPLETED' &&
        t.status !== 'CANCELLED',
    ).length;

    return {
      hoursToday: toHours(sum(todaySessions)),
      hoursThisWeek: toHours(sum(weekSessions)),
      hoursThisMonth: toHours(sum(monthSessions)),
      pendingTasks,
      completedTasks,
      overdueTasks,
      activeGoals: goals.length,
      currentStreak: await this.calculateStreak(userId),
    };
  },

  async charts(userId: string) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 29);

    const sessions = await prisma.studySession.findMany({
      where: { userId, startedAt: { gte: startOfDay(from) } },
      select: { startedAt: true, durationMinutes: true, subjectId: true },
    });

    const byDayMap = new Map<string, number>();
    const bySubjectMap = new Map<string, number>();

    for (const s of sessions) {
      const key = s.startedAt.toISOString().slice(0, 10);
      byDayMap.set(key, (byDayMap.get(key) ?? 0) + s.durationMinutes);
      bySubjectMap.set(s.subjectId, (bySubjectMap.get(s.subjectId) ?? 0) + s.durationMinutes);
    }

    const byDay = Array.from(byDayMap.entries())
      .map(([date, minutes]) => ({ date, hours: toHours(minutes) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const subjectIds = Array.from(bySubjectMap.keys());
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true, color: true },
    });

    const bySubject = subjects.map((s) => ({
      subjectId: s.id,
      name: s.name,
      color: s.color,
      hours: toHours(bySubjectMap.get(s.id) ?? 0),
    }));

    return { byDay, bySubject };
  },

  async stats(userId: string) {
    const sessions = await prisma.studySession.findMany({
      where: { userId },
      select: { durationMinutes: true, startedAt: true, subjectId: true },
    });

    if (sessions.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        averagePerSession: 0,
        longestSession: 0,
        mostStudiedSubject: null,
        mostProductiveDay: null,
        currentStreak: 0,
      };
    }

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = toHours(totalMinutes);
    const averagePerSession = Number((totalMinutes / sessions.length / 60).toFixed(2));
    const longestSession = Math.max(...sessions.map((s) => s.durationMinutes));

    const bySubject = new Map<string, number>();
    const byDay = new Map<string, number>();

    for (const s of sessions) {
      bySubject.set(s.subjectId, (bySubject.get(s.subjectId) ?? 0) + s.durationMinutes);
      const day = s.startedAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + s.durationMinutes);
    }

    const topSubjectId = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const topSubject = topSubjectId
      ? await prisma.subject.findUnique({
          where: { id: topSubjectId },
          select: { id: true, name: true, color: true },
        })
      : null;

    const topDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      totalHours,
      totalSessions: sessions.length,
      averagePerSession,
      longestSession: toHours(longestSession),
      mostStudiedSubject: topSubject,
      mostProductiveDay: topDay ? { date: topDay[0], hours: toHours(topDay[1]) } : null,
      currentStreak: await this.calculateStreak(userId),
    };
  },

  async calculateStreak(userId: string): Promise<number> {
    const sessions = await prisma.studySession.findMany({
      where: { userId },
      select: { startedAt: true },
      orderBy: { startedAt: 'desc' },
    });

    if (sessions.length === 0) return 0;

    const days = new Set(sessions.map((s) => s.startedAt.toISOString().slice(0, 10)));

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    let cursor: Date;
    if (days.has(todayKey)) {
      cursor = today;
    } else if (days.has(yesterdayKey)) {
      cursor = yesterday;
    } else {
      return 0;
    }

    let streak = 0;
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!days.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  },
};