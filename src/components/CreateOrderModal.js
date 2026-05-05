'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';

export default function CreateOrderModal({ employee, onClose, onSuccess }) {
  const { t, i18n } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [order, setOrder] = useState(true);

  const isArabic = i18n.language === 'ar';
  const employeeName = isArabic ? employee.nameAR : employee.nameEN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.createOrder({
        employeeIqamaNo: employee.iqamaNo,
        order,
        notes: notes || undefined
      });
      
      onSuccess(response);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h3>{t('create_order')} - {employeeName}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-alert">{error}</div>}
          
          <div className="form-group">
            <label>{t('iqama_no')}</label>
            <input 
              type="text" 
              className="input-field" 
              value={employee.iqamaNo} 
              disabled 
            />
          </div>

          <div className="form-group">
            <label>{t('status')}</label>
            <select 
              className="input-field"
              value={order.toString()}
              onChange={(e) => setOrder(e.target.value === 'true')}
            >
              <option value="true">{t('on_order')}</option>
              <option value="false">{t('available')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('notes')}</label>
            <textarea 
              className="input-field"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="..."
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '...' : t('submit')}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          background: var(--surface);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .close-btn {
          font-size: 1.5rem;
          color: var(--text-secondary);
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          color: var(--text);
          font-weight: 600;
        }
        .error-alert {
          background: rgba(186, 0, 13, 0.1);
          color: var(--error);
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          border: 1px solid rgba(186, 0, 13, 0.2);
        }
      `}</style>
    </div>
  );
}
