'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getStatistics();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err.title || err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-wrapper" dir={dir}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>{t('welcome')}</h1>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {loading ? (
        <div className="grid-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: '140px', animation: 'pulse 1.5s infinite alternate' }}>
              <div style={{ background: 'var(--border)', height: '20px', width: '50%', marginBottom: '1rem', borderRadius: '4px' }}></div>
              <div style={{ background: 'var(--border)', height: '40px', width: '30%', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid-auto">
            <div className="glass-card stats-card">
              <h3 className="stats-title">{t('active_orders')}</h3>
              <div className="stats-value text-primary">{stats?.currentlyActiveOrders || 0}</div>
            </div>
            
            <div className="glass-card stats-card">
              <h3 className="stats-title">{t('today_report')}</h3>
              <div className="stats-value text-success">{stats?.totalOrdersToday || 0}</div>
            </div>
            
            <div className="glass-card stats-card">
              <h3 className="stats-title">{t('employees')}</h3>
              <div className="stats-value text-accent">{stats?.totalEligibleEmployees || 0}</div>
            </div>
            
            <div className="glass-card stats-card">
              <h3 className="stats-title">{t('avg_mins')}</h3>
              <div className="stats-value">{stats?.averageMinutesPerOrder ? stats.averageMinutesPerOrder.toFixed(1) : 0}</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="glass-card">
              <h3 className="card-title">{t('orders_by_month')}</h3>
              <div className="chart-container">
                {stats?.ordersByMonth && Object.entries(stats.ordersByMonth).map(([month, count]) => {
                  const maxCount = Math.max(...Object.values(stats.ordersByMonth));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={month} className="chart-bar-wrapper">
                      <div className="chart-label">{month}</div>
                      <div className="chart-track">
                        <div className="chart-fill" style={{ width: `${percentage}%` }}>
                          <span className="chart-value">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="card-title">{t('top_employees')}</h3>
              <div className="employee-list">
                {stats?.ordersByEmployee && Object.entries(stats.ordersByEmployee)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, count]) => (
                    <div key={name} className="employee-item">
                      <div className="emp-name">{name}</div>
                      <div className="emp-stats">
                        <span className="badge">{count} {t('orders')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 0.2; }
        }
        .stats-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .stats-title {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .stats-value {
          font-size: 2.5rem;
          font-weight: bold;
        }
        .text-primary { color: var(--primary); }
        .text-success { color: var(--success); }
        .text-accent { color: var(--accent); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
        .card-title {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
          color: var(--text);
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .chart-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .chart-label {
          width: 52px;
          flex-shrink: 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .chart-track {
          flex: 1;
          height: 22px;
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .chart-fill {
          height: 100%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
          min-width: 30px;
          transition: width 0.5s ease;
        }
        .chart-value {
          color: #000;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .employee-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .employee-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
          gap: 0.5rem;
        }
        /* RTL: reverse the name / badge order */
        [dir="rtl"] .employee-item { flex-direction: row-reverse; }
        .employee-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .emp-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
        .badge {
          background: rgba(0, 138, 0, 0.1);
          color: var(--success);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        /* ── Mobile overrides ── */
        @media (max-width: 480px) {
          .stats-value { font-size: 1.9rem; }
          .stats-title { font-size: 0.82rem; }
          .card-title { font-size: 1.05rem; margin-bottom: 1rem; }
          .dashboard-grid { gap: 1rem; margin-top: 1rem; }
        }
      `}</style>
    </div>
  );
}
