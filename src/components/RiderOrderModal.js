'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';
import RiderSelector from '@/components/RiderSelector';

/**
 * RiderOrderModal
 * Opens a full-screen modal for selecting a rider and submitting a new order.
 *
 * Props:
 *   onClose()        — called when the modal is dismissed
 *   onSuccess(order) — called after the order is successfully created
 */
export default function RiderOrderModal({ onClose, onSuccess }) {
  const { t, i18n } = useTranslation('common');
  const isRtl = i18n.language === 'ar';

  const [selection, setSelection] = useState(null); // { riderId, nameAr, nameEn, note }
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  /* ── submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!selection?.riderId) {
      setError(isRtl ? 'يرجى اختيار سائق أولاً' : 'Please select a rider first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiService.createOrder({
        employeeIqamaNo: selection.riderId,
        order: true,
        notes: selection.note || undefined,
      });
      onSuccess?.(response);
    } catch (err) {
      setError(err.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="rom-overlay" role="dialog" aria-modal="true" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="rom-panel glass-card">

        {/* ── header ── */}
        <div className="rom-header">
          <div className="rom-header-text">
            <h2 className="rom-title">{t('select_rider')}</h2>
            <p className="rom-subtitle">{t('select_rider_hint')}</p>
          </div>
          <button className="rom-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── selected summary bar ── */}
        <div className={`rom-summary${selection ? ' rom-summary--visible' : ''}`}>
          {selection ? (
            <>
              <span className="rom-summary-dot" />
              <span className="rom-summary-label">
                {isRtl ? 'تم الاختيار:' : 'Selected:'}
              </span>
              <span className="rom-summary-name">
                {isRtl ? selection.nameAr : selection.nameEn}
              </span>
              {selection.note && (
                <span className="rom-summary-note">
                  {isRtl ? '— ملاحظة: ' : '— Note: '}
                  {selection.note.length > 40
                    ? selection.note.slice(0, 40) + '…'
                    : selection.note}
                </span>
              )}
            </>
          ) : null}
        </div>

        {/* ── rider grid ── */}
        <div className="rom-body">
          <RiderSelector onSelectionChange={setSelection} />
        </div>

        {/* ── error ── */}
        {error && <div className="rom-error">{error}</div>}

        {/* ── footer actions ── */}
        <div className="rom-footer">
          <button
            type="button"
            className="rom-btn rom-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            className={`rom-btn rom-btn--submit${!selection ? ' rom-btn--disabled' : ''}`}
            onClick={handleSubmit}
            disabled={loading || !selection}
          >
            {loading ? (
              <span className="rom-spinner" />
            ) : (
              <>
                <svg className="rom-btn-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t('confirm_order')}
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ── overlay ────────────────────────────────────── */
        .rom-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 1000;
          padding: 1.5rem 1rem;
          overflow-y: auto;
          animation: romFadeIn 0.22s ease;
        }
        @keyframes romFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── panel ──────────────────────────────────────── */
        .rom-panel {
          width: 100%;
          max-width: 900px;
          background: var(--surface);
          border-radius: 18px;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: romSlideUp 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.22);
        }
        @keyframes romSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        /* ── header ─────────────────────────────────────── */
        .rom-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.75rem 2rem 1.25rem;
          border-bottom: 1px solid var(--border);
          gap: 1rem;
        }
        .rom-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.25rem;
        }
        .rom-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .rom-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s, border-color 0.18s;
          color: var(--text-secondary);
        }
        .rom-close:hover {
          background: rgba(186, 0, 13, 0.08);
          border-color: var(--error);
          color: var(--error);
        }
        .rom-close svg { width: 16px; height: 16px; }

        /* ── summary bar ─────────────────────────────────── */
        .rom-summary {
          height: 0;
          overflow: hidden;
          padding: 0 2rem;
          background: linear-gradient(90deg, rgba(255,153,0,0.08), rgba(255,153,0,0.03));
          border-bottom: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text);
          transition: height 0.22s ease, padding 0.22s ease, border-color 0.22s ease;
          flex-wrap: wrap;
        }
        .rom-summary--visible {
          height: 44px;
          padding: 0 2rem;
          border-color: rgba(255,153,0,0.2);
        }
        .rom-summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          flex-shrink: 0;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
        .rom-summary-label { color: var(--text-secondary); font-weight: 500; }
        .rom-summary-name  { font-weight: 700; color: var(--text); }
        .rom-summary-note  { color: var(--text-secondary); font-style: italic; }

        /* ── body ────────────────────────────────────────── */
        .rom-body {
          padding: 1.5rem 2rem;
          overflow-y: auto;
          max-height: calc(100vh - 300px);
        }
        @media (max-width: 600px) {
          .rom-body { padding: 1rem; }
          .rom-header { padding: 1.25rem 1rem 1rem; }
        }

        /* ── error ───────────────────────────────────────── */
        .rom-error {
          margin: 0 2rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(186, 0, 13, 0.08);
          color: var(--error);
          border: 1px solid rgba(186, 0, 13, 0.2);
          font-size: 0.875rem;
        }

        /* ── footer ──────────────────────────────────────── */
        .rom-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.25rem 2rem 1.75rem;
          border-top: 1px solid var(--border);
        }
        @media (max-width: 480px) {
          .rom-footer { flex-direction: column; }
          .rom-btn    { width: 100%; justify-content: center; }
        }

        .rom-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          border-radius: 24px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .rom-btn--cancel {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }
        .rom-btn--cancel:hover:not(:disabled) {
          background: rgba(0,0,0,0.04);
        }
        .rom-btn--submit {
          background: var(--primary);
          color: #000;
          box-shadow: 0 2px 8px rgba(255, 153, 0, 0.3);
        }
        .rom-btn--submit:hover:not(:disabled) {
          background: #e68a00;
          box-shadow: 0 4px 16px rgba(255, 153, 0, 0.4);
          transform: translateY(-1px);
        }
        .rom-btn--disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .rom-btn-icon { width: 16px; height: 16px; }

        /* ── spinner ─────────────────────────────────────── */
        .rom-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(0,0,0,0.25);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
