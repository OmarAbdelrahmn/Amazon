'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';

export default function EmployeesPage() {
  const { t, i18n } = useTranslation('common');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="employees-wrapper" dir={dir}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>{t('employees')}</h1>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card table-container">
        {loading ? (
          <div className="loading-state">{t('loading')}...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">{t('no_employees_found')}</div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="table-desktop">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('iqama_no')}</th>
                    <th>{t('employees')}</th>
                    <th>{t('job_title')}</th>
                    <th>{t('status')}</th>
                    <th>{t('total_orders_today')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.iqamaNo}>
                      <td>{emp.iqamaNo}</td>
                      <td className="font-medium">{isArabic ? emp.nameAR : emp.nameEN}</td>
                      <td>{emp.jobTitle}</td>
                      <td>
                        <span className={`status-badge ${emp.isCurrentlyOnOrder ? 'active' : 'idle'}`}>
                          {emp.isCurrentlyOnOrder ? t('on_order') : t('available')}
                        </span>
                      </td>
                      <td>{emp.totalOrdersToday}</td>
                      <td className="actions-cell">
                        <Link href={`/employees/${emp.iqamaNo}`} className="btn-view">
                          {t('view')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="table-mobile">
              {employees.map(emp => (
                <div key={emp.iqamaNo} className="emp-card">
                  <div className="emp-card-top">
                    <div className="emp-card-info">
                      <div className="emp-card-name">{isArabic ? emp.nameAR : emp.nameEN}</div>
                      <div className="emp-card-sub">{emp.jobTitle} • {emp.iqamaNo}</div>
                    </div>
                    <span className={`status-badge ${emp.isCurrentlyOnOrder ? 'active' : 'idle'}`}>
                      {emp.isCurrentlyOnOrder ? t('on_order') : t('available')}
                    </span>
                  </div>
                  <div className="emp-card-row">
                    <span className="emp-card-meta">
                      {t('total_orders_today')}: <strong>{emp.totalOrdersToday}</strong>
                    </span>
                    <Link href={`/employees/${emp.iqamaNo}`} className="btn-view">
                      {t('view')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .employees-wrapper { width: 100%; }
        .table-container { overflow-x: auto; padding: 0; }

        /* ── Desktop table ── */
        .table-desktop { display: block; }
        .data-table { width: 100%; border-collapse: collapse; }
        /* RTL: right-align text for Arabic */
        [dir="ltr"] .data-table { text-align: left; }
        [dir="rtl"] .data-table { text-align: right; }

        .data-table th, .data-table td {
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .data-table th {
          color: var(--text-secondary);
          font-weight: 600;
          background: rgba(0,0,0,0.02);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: var(--primary-muted); }
        .font-medium { font-weight: 500; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .status-badge.active { background: rgba(0,138,0,0.1); color: var(--success); }
        .status-badge.idle { background: rgba(113,113,113,0.1); color: var(--text-secondary); }

        .actions-cell { display: flex; gap: 0.4rem; align-items: center; }
        /* RTL: flip actions column */
        [dir="rtl"] .actions-cell { justify-content: flex-start; }

        /* ── View button ── */
        .btn-view {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.45rem 1.1rem;
          min-height: 36px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          background: var(--primary);
          color: #000;
          border: none;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s;
          letter-spacing: 0.01em;
        }
        .btn-view:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .btn-view:active { transform: translateY(0); }

        .loading-state, .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }

        /* ── Mobile card list ── */
        .table-mobile { display: none; }
        .emp-card {
          padding: 1rem 1.1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .emp-card:last-child { border-bottom: none; }
        .emp-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
        }
        [dir="rtl"] .emp-card-top { flex-direction: row-reverse; }
        .emp-card-name { font-weight: 600; font-size: 0.95rem; color: var(--text); margin-bottom: 0.15rem; }
        .emp-card-sub { font-size: 0.78rem; color: var(--text-secondary); }
        .emp-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        [dir="rtl"] .emp-card-row { flex-direction: row-reverse; }
        .emp-card-meta { font-size: 0.82rem; color: var(--text-secondary); }
        .emp-card-meta strong { color: var(--text); }

        /* ── Breakpoints ── */
        @media (max-width: 640px) {
          .table-desktop { display: none; }
          .table-mobile { display: block; }
          .table-container { padding: 0; }
        }
      `}</style>
    </div>
  );
}
