'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Package, Clock, Users, Activity } from 'lucide-react';

const MONTH_NAMES = {
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
};

function formatMonth(key, lang) {
  // key might be "2026-05" or "May" etc.
  const parts = key.split('-');
  if (parts.length === 2) {
    const idx = parseInt(parts[1], 10) - 1;
    const names = lang === 'ar' ? MONTH_NAMES.ar : MONTH_NAMES.en;
    return names[idx] ?? key;
  }
  return key;
}

const MEDAL = ['🥇','🥈','🥉'];

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  const lang = i18n.language;

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
        console.error('Failed to load dashboard data', err);
        setError(err.title || err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = stats ? [
    {
      label: t('active_orders'),
      value: stats.currentlyActiveOrders || 0,
      icon: Activity,
      bgClass: 'bg-orange-gradient',
    },
    {
      label: t('today_report'),
      value: stats.totalOrdersToday || 0,
      icon: Package,
      bgClass: 'bg-green-gradient',
    },
    {
      label: t('employees'),
      value: stats.totalEligibleEmployees || 0,
      icon: Users,
      bgClass: 'bg-blue-gradient',
    },
    {
      label: t('avg_mins'),
      value: stats.averageMinutesPerOrder ? stats.averageMinutesPerOrder.toFixed(1) : '0',
      icon: Clock,
      bgClass: 'bg-red-gradient',
      suffix: isArabic ? 'د' : 'm',
    },
  ] : [];

  const chartEntries = stats?.ordersByMonth
    ? Object.entries(stats.ordersByMonth)
    : [];
  const maxCount = chartEntries.length
    ? Math.max(...chartEntries.map(([, v]) => v))
    : 1;

  const topEmployees = stats?.ordersByEmployee
    ? Object.entries(stats.ordersByEmployee)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];


  return (
    <div className="dashboard-wrapper" dir={dir}>

      {/* ── Page heading ── */}
      <div className="page-heading">
        <div>
          <div className="section-label">{isArabic ? 'نظرة عامة' : 'Overview'}</div>
          <h1>{t('welcome')}</h1>
        </div>
      </div>

      {error && (
        <div className="error-alert" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      {/* ── Skeleton ── */}
      {loading ? (
        <div className="grid-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card sk-card">
              <div className="sk-icon" />
              <div className="sk-line sk-line--short" />
              <div className="sk-line sk-line--long" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className={`stat-card ${card.bgClass} animate-fade-in`}>
                  <div className="stat-icon-wrapper">
                    <Icon size={20} color="#fff" />
                  </div>
                  <Icon className="stat-ghost-icon" size={70} color="#fff" />
                  <div className="stat-content">
                    <h3>
                      {card.value}
                      {card.suffix && <span className="stat-suffix">{card.suffix}</span>}
                    </h3>
                    <p>{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Charts grid ── */}
          <div className="dash-grid">
            {/* Bar chart */}
            <div className="glass-card animate-fade-in">
              <h3 className="card-title">{t('orders_by_month')}</h3>
              <div className="chart-container">
                {chartEntries.map(([month, count]) => {
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={month} className="bar-row">
                      <div className="bar-label">{formatMonth(month, lang)}</div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${pct}%` }}
                          title={`${count}`}
                        >
                          <span className="bar-count">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {chartEntries.length === 0 && (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    {t('no_data')}
                  </div>
                )}
              </div>
            </div>

            {/* Top employees leaderboard */}
            <div className="glass-card animate-fade-in">
              <h3 className="card-title">{t('top_employees')}</h3>
              {topEmployees.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>{t('no_data')}</div>
              ) : (
                <ol className="leader-list">
                  {topEmployees.map(([name, count], idx) => (
                    <li key={name} className="leader-item">
                      <div className="leader-rank">
                        {idx < 3 ? (
                          <span className="medal">{MEDAL[idx]}</span>
                        ) : (
                          <span className="rank-num">{idx + 1}</span>
                        )}
                      </div>
                      <div className="leader-name">{name}</div>
                      <div className="leader-right">
                        <span className="leader-count">{count}</span>
                        <span className="leader-unit">{t('orders')}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* ── Heading ── */
        .page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .page-heading h1 { margin-top: 0.1rem; }

        /* ── Skeleton ── */
        @keyframes shimmer {
          0%   { opacity: 0.55; }
          100% { opacity: 0.18; }
        }
        .sk-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .sk-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--border);
          animation: shimmer 1.4s ease-in-out infinite alternate;
        }
        .sk-line {
          height: 14px; border-radius: 6px;
          background: var(--border);
          animation: shimmer 1.4s ease-in-out infinite alternate;
        }
        .sk-line--short { width: 55%; }
        .sk-line--long  { width: 30%; height: 28px; }

        /* ── Stats Grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          position: relative;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          overflow: hidden;
          box-shadow: var(--shadow);
          color: #fff;
        }
        .bg-blue-gradient { background: linear-gradient(135deg, var(--accent), #355bc2ff); }
        .bg-orange-gradient { background: linear-gradient(135deg, #f59e0b, #f97316); }
        .bg-green-gradient { background: linear-gradient(135deg, #10b981, #057a55ff); }
        .bg-red-gradient { background: linear-gradient(135deg, var(--error), #9c767aff); }
        .stat-icon-wrapper { background: rgba(255, 255, 255, 0.15); width: fit-content; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.75rem; }
        .stat-ghost-icon { position: absolute; left: -1rem; bottom: -1rem; opacity: 0.2; transform: rotate(12deg); }
        .stat-content { position: relative; z-index: 10; }
        .stat-content h3 { font-size: 1.75rem; margin: 0 0 0.25rem; font-weight: 800; line-height: 1.1; }
        .stat-content p { margin: 0; font-size: 0.875rem; font-weight: 500; opacity: 0.95; }
        .stat-suffix {
          font-size: 0.9rem;
          font-weight: 600;
          margin-${isArabic ? 'right' : 'left'}: 0.2rem;
          opacity: 0.7;
        }

        /* ── Charts grid ── */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 860px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
        .card-title {
          margin-bottom: 1.4rem;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
        }

        /* ── Bar chart ── */
        .chart-container { display: flex; flex-direction: column; gap: 0.8rem; }
        .bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        [dir="rtl"] .bar-row { flex-direction: row-reverse; }
        .bar-label {
          width: 48px;
          flex-shrink: 0;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: ${isArabic ? 'right' : 'left'};
        }
        .bar-track {
          flex: 1;
          height: 26px;
          background: var(--surface-2);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-hover), var(--primary));
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 0.55rem;
          min-width: 36px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        [dir="rtl"] .bar-fill {
          background: linear-gradient(270deg, var(--primary-hover), var(--primary));
          justify-content: flex-start;
        }
        .bar-count {
          color: #000;
          font-size: 0.74rem;
          font-weight: 700;
        }

        /* ── Leaderboard ── */
        .leader-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .leader-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--border);
        }
        .leader-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .medal { font-size: 1.15rem; line-height: 1; }
        .rank-num {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .leader-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .leader-right {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          flex-shrink: 0;
        }
        .leader-count {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--primary);
        }
        .leader-unit {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: lowercase;
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .stat-number { font-size: 1.65rem; }
          .stat-label-text { font-size: 0.74rem; }
          .card-title { font-size: 0.95rem; margin-bottom: 1rem; }
          .dash-grid { gap: 1rem; }
          .stat-card { gap: 0.85rem; }
          .stat-icon-wrap { width: 44px; height: 44px; border-radius: 11px; }
          .stat-icon { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
}
