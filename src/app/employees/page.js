'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import CreateOrderModal from '@/components/CreateOrderModal';

export default function EmployeesPage() {
  const { t, i18n } = useTranslation('common');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOrderSuccess = (newOrder) => {
    setSelectedEmployee(null);
    fetchEmployees(); // Refresh list to get updated snapshot
  };

  const isArabic = i18n.language === 'ar';

  return (
    <div className="employees-wrapper">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1>{t('employees')}</h1>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card table-container">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="empty-state">No active employees found.</div>
        ) : (
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
                    <button 
                      className="btn-action primary"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      {t('create_order')}
                    </button>
                    <Link href={`/employees/${emp.iqamaNo}`} className="btn-action secondary">
                      {t('view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedEmployee && (
        <CreateOrderModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
          onSuccess={handleOrderSuccess} 
        />
      )}

      <style jsx>{`
        .table-container {
          overflow-x: auto;
          padding: 0;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        [dir="rtl"] .data-table {
          text-align: right;
        }
        .data-table th, .data-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .data-table th {
          color: var(--text-secondary);
          font-weight: 600;
          background: rgba(0,0,0,0.02);
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        .data-table tbody tr:hover {
          background: rgba(0,0,0,0.01);
        }
        .font-medium {
          font-weight: 500;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .status-badge.active {
          background: rgba(0, 138, 0, 0.1);
          color: var(--success);
        }
        .status-badge.idle {
          background: rgba(113, 113, 113, 0.1);
          color: var(--text-secondary);
        }
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }
        .btn-action {
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
        }
        .btn-action.primary {
          background: var(--primary);
          color: #000;
        }
        .btn-action.secondary {
          border: 1px solid var(--border);
          color: var(--text);
        }
        .loading-state, .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
