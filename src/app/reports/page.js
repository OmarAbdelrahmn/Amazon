'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiService } from '@/services/api';

export default function ReportsPage() {
  const { t, i18n } = useTranslation('common');
  
  // Default to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isArabic = i18n.language === 'ar';

  const fetchReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Append time so it covers the whole day correctly
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;
      
      const reportData = await apiService.getRangeReport(startIso, endIso);
      setData(reportData);
    } catch (err) {
      setError(err.title || err.message || 'Failed to generate report.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-wrapper">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1>{t('reports')}</h1>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={fetchReport} className="report-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('start_date')}</label>
              <input 
                type="date" 
                className="input-field" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('end_date')}</label>
              <input 
                type="date" 
                className="input-field" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '...' : t('generate_report')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {data && (
        <div className="report-results animate-fade-in">
          <div className="summary-cards grid-auto" style={{ marginBottom: '2rem' }}>
            <div className="glass-card summary-box">
              <div className="stat-label">{t('total_orders_all_time')}</div>
              <div className="stat-val text-primary">{data.totalOrders}</div>
            </div>
            <div className="glass-card summary-box">
              <div className="stat-label">{t('total_employees_involved')}</div>
              <div className="stat-val text-accent">{data.totalEmployeesInvolved}</div>
            </div>
            <div className="glass-card summary-box">
              <div className="stat-label">{t('total_minutes_worked')}</div>
              <div className="stat-val">{data.totalMinutesWorked ? data.totalMinutesWorked.toFixed(1) : 0}</div>
            </div>
            <div className="glass-card summary-box">
              <div className="stat-label">{t('total_days')}</div>
              <div className="stat-val">{data.totalDays}</div>
            </div>
          </div>

          <div className="report-tables">
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-header">
                <h3>{t('daily_report')} Breakdown</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Total Orders</th>
                      <th>Active Employees</th>
                      <th>Total Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daySummaries?.map(day => (
                      <tr key={day.date}>
                        <td>{day.date}</td>
                        <td>{day.totalOrders}</td>
                        <td>{day.activeEmployees}</td>
                        <td>{day.totalMinutesWorked ? day.totalMinutesWorked.toFixed(1) : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1.5rem' }}>
              <div className="table-header">
                <h3>{t('top_employees')} Breakdown</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('iqama_no')}</th>
                      <th>{t('employees')}</th>
                      <th>{t('orders')}</th>
                      <th>Days Active</th>
                      <th>Total Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.employeeSummaries?.map(emp => (
                      <tr key={emp.iqamaNo}>
                        <td>{emp.iqamaNo}</td>
                        <td className="font-medium">{isArabic ? emp.nameAR : emp.nameEN}</td>
                        <td>
                          <span className="badge success">{emp.totalOrders}</span>
                        </td>
                        <td>{emp.daysActive}</td>
                        <td>{emp.totalMinutesOnOrder ? emp.totalMinutesOnOrder.toFixed(1) : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .report-form {
          width: 100%;
        }
        .form-row {
          display: flex;
          gap: 1.5rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .form-group {
          flex: 1;
          min-width: 200px;
        }
        .form-actions {
          flex: 0 0 auto;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .summary-box {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 1.5rem;
        }
        .stat-label {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .stat-val {
          font-size: 2rem;
          font-weight: bold;
        }
        .text-primary { color: var(--primary); }
        .text-accent { color: var(--accent); }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          background: rgba(0,0,0,0.02);
        }
        .table-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        .table-container {
          overflow-x: auto;
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
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
        .badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge.success {
          background: rgba(0, 138, 0, 0.1);
          color: var(--success);
        }
      `}</style>
    </div>
  );
}
