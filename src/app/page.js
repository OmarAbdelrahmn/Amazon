'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

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
      icon: '🚴',
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
    },
    {
      label: t('today_report'),
      value: stats.totalOrdersToday || 0,
      icon: '📦',
      color: 'var(--success)',
      bg: 'var(--success-light)',
    },
    {
      label: t('employees'),
      value: stats.totalEligibleEmployees || 0,
      icon: '👥',
      color: 'var(--accent)',
      bg: 'rgba(0,112,192,0.1)',
    },
    {
      label: t('avg_mins'),
      value: stats.averageMinutesPerOrder ? stats.averageMinutesPerOrder.toFixed(1) : '0',
      icon: '⏱',
      color: 'var(--warning)',
      bg: 'rgba(179,90,0,0.1)',
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
          <div className="grid-auto" style={{ marginBottom: '1.75rem' }}>
            {statCards.map(card => (
              <div key={card.label} className="glass-card stat-card animate-fade-in">
                <div className="stat-icon-wrap" style={{ background: card.bg }}>
                  <span className="stat-icon">{card.icon}</span>
                </div>
                <div className="stat-body">
                  <div className="stat-label-text">{card.label}</div>
                  <div className="stat-number" style={{ color: card.color }}>
                    {card.value}
                    {card.suffix && <span className="stat-suffix">{card.suffix}</span>}
                  </div>
                </div>
              </div>
            ))}
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
                      <div className="leader-right">
                        <span className="leader-count">{count}</span>
                        <span className="leader-unit">{t('orders')}</span>
                      </div>
                      <div className="leader-name">{name}</div>
                      <div className="leader-rank">
                        {idx < 3 ? (
                          <span className="medal">{MEDAL[idx]}</span>
                        ) : (
                          <span className="rank-num">{idx + 1}</span>
                        )}
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

        /* ── Stat card ── */
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .stat-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon { font-size: 1.55rem; line-height: 1; }
        .stat-body { flex: 1; min-width: 0; }
        .stat-label-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }
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
          justify-content: space-between;
          gap: 0.85rem;
          padding: 0.8rem 0;
          border-bottom: 1px solid var(--border);
        }
        [dir="rtl"] .leader-item { flex-direction: row-reverse; }
        .leader-item:last-child { border-bottom: none; padding-bottom: 0; }
        .leader-item:first-child { padding-top: 0; }
        .leader-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
          flex: 1;
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
