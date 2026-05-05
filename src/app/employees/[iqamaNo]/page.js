'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { apiService } from '@/services/api';
import CreateOrderModal from '@/components/CreateOrderModal';

export default function EmployeeDetailsPage({ params }) {
  // In Next.js 15, params is a Promise, so we must unwrap it using React.use()
  const resolvedParams = use(params);
  const iqamaNo = resolvedParams.iqamaNo;
  
  const { t, i18n } = useTranslation('common');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchEmployee = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getEmployee(iqamaNo);
      setEmployee(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [iqamaNo]);

  const handleOrderSuccess = () => {
    setShowModal(false);
    fetchEmployee(); // Refresh data
  };

  if (loading) return <div className="container animate-fade-in"><div className="glass-card">Loading...</div></div>;
  if (error) return <div className="container animate-fade-in"><div className="error-alert">{error}</div></div>;
  if (!employee) return <div className="container animate-fade-in">Employee not found</div>;

  const isArabic = i18n.language === 'ar';

  return (
    <div className="employee-details-wrapper animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <Link href="/employees" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            &larr; Back to {t('employees')}
          </Link>
          <h1>{t('employee_details')}</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + {t('create_order')}
        </button>
      </div>

      <div className="grid-auto">
        <div className="glass-card">
          <div className="profile-header">
            <div className="avatar">{isArabic ? employee.nameAR.charAt(0) : employee.nameEN.charAt(0)}</div>
            <div>
              <h2>{isArabic ? employee.nameAR : employee.nameEN}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{employee.jobTitle}</p>
            </div>
          </div>
          
          <div className="details-grid">
            <div className="detail-item">
              <label>{t('iqama_no')}</label>
              <span>{employee.iqamaNo}</span>
            </div>
            <div className="detail-item">
              <label>{t('status')}</label>
              <span className={`status-badge ${employee.isCurrentlyOnOrder ? 'active' : 'idle'}`}>
                {employee.isCurrentlyOnOrder ? t('on_order') : t('available')}
              </span>
            </div>
            <div className="detail-item">
              <label>{t('country')}</label>
              <span>{employee.country}</span>
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <span dir="ltr" style={{ textAlign: isArabic ? 'right' : 'left' }}>{employee.phone}</span>
            </div>
            <div className="detail-item">
              <label>{t('housing')}</label>
              <span>{employee.housingName}</span>
            </div>
            <div className="detail-item">
              <label>Working ID</label>
              <span>{employee.workingId}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Order Activity</h3>
          
          <div className="activity-stats">
            <div className="stat-box">
              <label>{t('total_orders_today')}</label>
              <div className="value">{employee.totalOrdersToday}</div>
            </div>
            
            {employee.isCurrentlyOnOrder && (
              <div className="stat-box active-order">
                <label>Current Order Started</label>
                <div className="value" style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>
                  {new Date(employee.currentOrderStartedAt).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CreateOrderModal 
          employee={employee} 
          onClose={() => setShowModal(false)} 
          onSuccess={handleOrderSuccess} 
        />
      )}

      <style jsx>{`
        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .detail-item label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }
        .detail-item span {
          font-weight: 500;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }
        .status-badge.active {
          background: rgba(0, 138, 0, 0.1);
          color: var(--success);
        }
        .status-badge.idle {
          background: rgba(113, 113, 113, 0.1);
          color: var(--text-secondary);
        }
        .activity-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .stat-box {
          background: rgba(0,0,0,0.02);
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        .stat-box label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .stat-box .value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--text);
          margin-top: 0.25rem;
        }
        .active-order {
          background: rgba(255, 153, 0, 0.05);
          border-color: rgba(255, 153, 0, 0.3);
        }
        .error-alert {
          background: rgba(186, 0, 13, 0.1);
          color: var(--error);
          padding: 0.75rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
