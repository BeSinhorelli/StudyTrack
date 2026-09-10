import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { getErrorMessage } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/feedback/Loading';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { EmptyState } from '../../components/feedback/EmptyState';
import { formatHours, formatDateShort } from '../../utils/format';
import type { DashboardSummary, DashboardCharts, DashboardStats } from '../../types/models';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      dashboardService.summary(),
      dashboardService.charts(),
      dashboardService.stats(),
    ])
      .then(([s, c, st]) => {
        setSummary(s);
        setCharts(c);
        setStats(st);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!summary || !charts || !stats) return null;

  const hasSessions = stats.totalSessions > 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Acompanhe seu progresso nos estudos"
      />

      {/* Cards de resumo */}
      <section className={styles.cards}>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Hoje</span>
          <span className={styles.statValue}>{formatHours(summary.hoursToday)}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Esta semana</span>
          <span className={styles.statValue}>{formatHours(summary.hoursThisWeek)}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Este mês</span>
          <span className={styles.statValue}>{formatHours(summary.hoursThisMonth)}</span>
        </Card>
        <Card className={`${styles.statCard} ${styles.streak}`}>
          <span className={styles.statLabel}>🔥 Sequência</span>
          <span className={styles.statValue}>
            {summary.currentStreak} {summary.currentStreak === 1 ? 'dia' : 'dias'}
          </span>
        </Card>
      </section>

      {/* Tasks / goals */}
      <section className={styles.cards}>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Tarefas pendentes</span>
          <span className={styles.statValue}>{summary.pendingTasks}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Tarefas concluídas</span>
          <span className={styles.statValue}>{summary.completedTasks}</span>
        </Card>
        <Card className={`${styles.statCard} ${summary.overdueTasks > 0 ? styles.danger : ''}`}>
          <span className={styles.statLabel}>Tarefas atrasadas</span>
          <span className={styles.statValue}>{summary.overdueTasks}</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>Metas ativas</span>
          <span className={styles.statValue}>{summary.activeGoals}</span>
        </Card>
      </section>

      {/* Gráficos */}
      {!hasSessions ? (
        <EmptyState
          icon="📊"
          title="Sem dados ainda"
          description="Registre sua primeira sessão de estudo para começar a ver os gráficos."
        />
      ) : (
        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Horas por dia (últimos 30 dias)</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e6eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    fontSize={12}
                    stroke="#6b7280"
                  />
                  <YAxis fontSize={12} stroke="#6b7280" />
                  <Tooltip
                    formatter={(v: number) => [formatHours(v), 'Horas']}
                    labelFormatter={(label) => `Data: ${formatDateShort(label)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Horas por matéria</h3>
            {charts.bySubject.length === 0 ? (
              <p className="text-muted">Sem dados.</p>
            ) : (
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.bySubject}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e6eb" />
                    <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                    <YAxis fontSize={12} stroke="#6b7280" />
                    <Tooltip formatter={(v: number) => [formatHours(v), 'Horas']} />
                    <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                      {charts.bySubject.map((entry) => (
                        <Cell key={entry.subjectId} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Estatísticas gerais */}
      <section className={styles.statsGrid}>
        <Card>
          <span className={styles.statLabel}>Total estudado</span>
          <span className={styles.statValue}>{formatHours(stats.totalHours)}</span>
        </Card>
        <Card>
          <span className={styles.statLabel}>Sessões registradas</span>
          <span className={styles.statValue}>{stats.totalSessions}</span>
        </Card>
        <Card>
          <span className={styles.statLabel}>Maior sessão</span>
          <span className={styles.statValue}>{formatHours(stats.longestSession)}</span>
        </Card>
        <Card>
          <span className={styles.statLabel}>Matéria mais estudada</span>
          <span className={styles.statValue}>
            {stats.mostStudiedSubject?.name ?? '—'}
          </span>
        </Card>
      </section>
    </>
  );
}