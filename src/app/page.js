'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

export default function Home() {
  const { t } = useTranslation('common');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Note: As we don't have the exact shape of getStatistics yet, we will fetch what we can.
        // We'll try to get today's report and employees count.
        const employees = await apiService.getEmployees().catch(() => []);
        
        // We can aggregate stats from the employees list for now since we have the data structure
        const activeOrders = employees.filter(e => e.isCurrentlyOnOrder).length;
        const completedToday = employees.reduce((sum, e) => sum + (e.totalOrdersToday || 0), 0);

        setStats({
          activeOrders: activeOrders || 0,
          totalEmployees: employees.length || 0,
          completedToday: completedToday || 0,
          revenue: 'N/A' // Placeholder until getStatistics shape is known
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1>{t('welcome')}</h1>
        <button className="btn-primary">
          <span>+</span> {t('create_order')}
        </button>
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
        <div className="grid-auto">
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('active_orders')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {stats?.activeOrders}
            </div>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('employees')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
              {stats?.totalEmployees}
            </div>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('today_report')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {stats?.completedToday}
            </div>
          </div>
          
          <div className="glass-card">
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('statistics')}</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {stats?.revenue}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
