'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/services/api';

export default function EmployeeDetailsPage() {
  const { t, i18n } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const { iqamaNo } = params;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    if (!iqamaNo) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const historyData = await apiService.getEmployeeHistory(iqamaNo);
        setData(historyData);
      } catch (err) {
        setError(err.title || err.message || 'Failed to load employee history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [iqamaNo]);

  return (
    <div className="employee-details-wrapper">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => router.back()} style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, flexShrink: 0 }}>
            {isArabic ? '→' : '←'}
          </button>
          <h1>{t('employee_details')}</h1>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {loading ? (
        <div className="loading-state">{t('status')}...</div>
      ) : data ? (
        <>
          <div className="profile-header glass-card">
            <div className="profile-info">
              <h2>{isArabic ? data.nameAR : data.nameEN}</h2>
              <div className="profile-badges">
                <span className="badge tag">{data.jobTitle}</span>
                <span className="badge tag">{data.country}</span>
                <span className={`badge ${data.currentStatus === 'enable' ? 'success' : 'idle'}`}>
                  {data.currentStatus}
                </span>
              </div>
              <p className="text-secondary mt-1">{t('iqama_no')}: {data.iqamaNo} • {t('housing')}: {data.housingName}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-box">
                <div className="stat-label">{t('total_orders_all_time')}</div>
                <div className="stat-val">{data.totalOrders}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">{t('avg_mins')}</div>
                <div className="stat-val">{data.averageMinutesPerOrder ? data.averageMinutesPerOrder.toFixed(1) : 0}</div>
              </div>
            </div>
          </div>

          <div className="history-section glass-card" style={{ marginTop: '1.5rem', padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3>{t('employee_history')}</h3>
            </div>
            
            {data.orders && data.orders.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('orders')} ID</th>
                      <th>{t('started_at')}</th>
                      <th>{t('ended_at')}</th>
                      <th>{t('duration_mins')}</th>
                      <th>{t('status')}</th>
                      <th>{t('notes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.startedAt).toLocaleString(i18n.language)}</td>
                        <td>{order.endedAt ? new Date(order.endedAt).toLocaleString(i18n.language) : '-'}</td>
                        <td>{order.durationMinutes ? order.durationMinutes.toFixed(1) : '-'}</td>
                        <td>
                          <span className={`status-badge ${order.order ? 'active' : 'idle'}`}>
                            {order.order ? t('on_order') : t('available')}
                          </span>
                        </td>
                        <td className="text-secondary">{order.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">{t('no_data')}</div>
            )}
          </div>
        </>
      ) : null}

      <style jsx>{`
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .profile-info h2 { margin-bottom: 0.5rem; font-size: 1.5rem; }
        .profile-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .badge {
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .badge.tag { background: rgba(0,0,0,0.05); color: var(--text-secondary); }
        .badge.success { background: rgba(0,138,0,0.1); color: var(--success); }
        .badge.idle { background: rgba(113,113,113,0.1); color: var(--text-secondary); }
        .mt-1 { margin-top: 0.75rem; }
        .text-secondary { color: var(--text-secondary); }

        .profile-stats { display: flex; gap: 1rem; flex-wrap: wrap; }
        .stat-box {
          background: rgba(0,0,0,0.02);
          padding: 0.9rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          min-width: 110px;
        }
        .stat-label { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem; }
        .stat-val { font-size: 1.4rem; font-weight: bold; color: var(--primary); }

        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        [dir="rtl"] .data-table { text-align: right; }
        .data-table th, .data-table td {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .data-table th { color: var(--text-secondary); font-weight: 600; background: rgba(0,0,0,0.02); font-size: 0.8rem; }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: rgba(0,0,0,0.01); }
        .status-badge {
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
        }
        .status-badge.active { background: rgba(0,138,0,0.1); color: var(--success); }
        .status-badge.idle { background: rgba(113,113,113,0.1); color: var(--text-secondary); }
        .empty-state { padding: 3rem; text-align: center; color: var(--text-secondary); }
        .btn-secondary {
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
          font-size: 1.1rem;
        }
        .btn-secondary:hover { background: rgba(0,0,0,0.05); }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .profile-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .profile-info h2 { font-size: 1.25rem; }
          .profile-stats { width: 100%; }
          .stat-box { flex: 1; min-width: 100px; }
          .stat-val { font-size: 1.25rem; }
          .data-table th, .data-table td { padding: 0.65rem 0.85rem; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
