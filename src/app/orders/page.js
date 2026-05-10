'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { apiService } from '@/services/api';
import RiderSelector from '@/components/RiderSelector';

export default function OrdersPage() {
  const { t, i18n } = useTranslation('common');
  const isArabic = i18n.language === 'ar';

  /* ── riders & active orders state ──────────────────────────────────────── */
  const [riders, setRiders] = useState(null);
  const [ridersLoading, setRidersLoading] = useState(true);
  const [ridersError, setRidersError] = useState('');
  const [closeLoading, setCloseLoading] = useState(false);

  // Derive active orders from riders
  const activeOrders = useMemo(() => {
    if (!riders) return [];
    return riders.filter(r => r.isCurrentlyOnOrder).map(r => ({
      iqamaNo: r.iqamaNo,
      nameAR: r.nameAR,
      nameEN: r.nameEN,
      jobTitle: r.jobTitle,
      housingName: r.housingName,
      minutesElapsed: r.currentOrderStartedAt 
        ? (new Date() - new Date(r.currentOrderStartedAt)) / 60000 
        : 0,
    }));
  }, [riders]);
  const totalActiveOrders = activeOrders.length;

  /* ── rider submit state ───────────────────────────────────────── */
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const successTimer = useRef(null);

  /* ── toast notification ───────────────────────────────────────── */
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }
  const toastTimer = useRef(null);

  const showToast = (msg, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  /* ── fetch riders ────────────────────────────────────────────── */
  const fetchRiders = useCallback(async () => {
    setRidersLoading(true);
    setRidersError('');
    try {
      const ridersData = await apiService.getEmployees();
      setRiders(ridersData);
    } catch (err) {
      setRidersError(err.title || err.message || 'Failed to load data.');
    } finally {
      setRidersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  /* ── close single order ───────────────────────────────────────── */
  const handleCloseOrder = async (iqamaNo) => {
    setCloseLoading(true);
    try {
      await apiService.closeOrder(iqamaNo);
      setTimeout(() => {
        fetchRiders();
      }, 2000);
      showToast(isArabic ? 'تم إغلاق الطلب بنجاح' : 'Order closed successfully');
    } catch (err) {
      showToast(err.title || err.message || 'Failed to close order', 'error');
    } finally {
      setCloseLoading(false);
    }
  };

  /* ── close all orders ─────────────────────────────────────────── */
  const handleCloseAll = async () => {
    setCloseLoading(true);
    try {
      await apiService.closeAllOrders();
      await fetchRiders();
      showToast(isArabic ? 'تم إغلاق جميع الطلبات' : 'All orders closed');
    } catch (err) {
      showToast(err.title || err.message || 'Failed to close all orders', 'error');
    } finally {
      setCloseLoading(false);
    }
  };

  /* ── instant rider select → create order ─────────────────────── */
  const handleRiderSelect = async (rider, note) => {
    setSubmittingId(rider.iqamaNo);
    setSubmitError('');
    clearTimeout(successTimer.current);

    try {
      await apiService.createOrder({
        employeeIqamaNo: rider.iqamaNo,
        order: true,
        notes: note || undefined,
      });

      setSuccessId(rider.iqamaNo);
      successTimer.current = setTimeout(() => setSuccessId(null), 1800);
      showToast(
        isArabic
          ? `✓ تم تعيين طلب لـ ${rider.nameAR}`
          : `✓ Order assigned to ${rider.nameEN}`
      );
      setTimeout(() => {
        fetchRiders();
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create order');
      showToast(err.message || 'Failed to create order', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="op-root" dir={isArabic ? 'rtl' : 'ltr'}>

      {/* ── toast ── */}
      {toast && (
        <div className={`op-toast op-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MAIN RIDER GRID  (left column in RTL = right visually)
         ══════════════════════════════════════════════════════════ */}
      <section className="op-main">
        <div className="op-main-header">
          <div>
            <h1 className="op-main-title">{t('select_rider')}</h1>
            <p className="op-main-hint">{t('select_rider_hint')}</p>
          </div>
        </div>

        {submitError && (
          <div className="op-submit-error">{submitError}</div>
        )}

        <div className="op-grid-scroll">
          <RiderSelector
            onSelect={handleRiderSelect}
            submittingId={submittingId}
            successId={successId}
            externalRiders={riders}
            loadingExternal={ridersLoading && !riders}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SIDE PANEL — Active Orders
         ══════════════════════════════════════════════════════════ */}
      <aside className="op-side">
        {/* side header */}
        <div className="op-side-header">
          <div className="op-side-title-row">
            <h2 className="op-side-title">
              {t('on_order')}
              <span className="op-badge op-badge--active">
                {totalActiveOrders}
              </span>
            </h2>
            <button
              className="op-refresh-btn"
              onClick={fetchRiders}
              disabled={ridersLoading || closeLoading}
              title={t('refresh')}
              aria-label={t('refresh')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                className={ridersLoading ? 'op-spinning' : ''}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>

          {ridersError && <div className="op-side-error">{ridersError}</div>}
        </div>

        {/* orders list */}
        <div className="op-side-body">
          {ridersLoading && !riders ? (
            <div className="op-side-loading">
              {[1, 2, 3].map(i => <div key={i} className="op-order-skeleton" />)}
            </div>
          ) : activeOrders.length > 0 ? (
            <div className="op-order-list">
              {activeOrders.map(order => (
                <div key={order.iqamaNo} className="op-order-card">
                  <div className="op-order-info">
                    <p className="op-order-name">
                      {isArabic ? order.nameAR : order.nameEN}
                    </p>
                    <p className="op-order-meta">
                      {order.jobTitle}
                      {order.housingName ? ` • ${order.housingName}` : ''}
                    </p>
                    <div className="op-order-tags">
                      <span className="op-tag">
                        {order.minutesElapsed
                          ? order.minutesElapsed.toFixed(1)
                          : '0'} {t('duration_mins')}
                      </span>
                    </div>
                  </div>
                  <button
                    className="op-close-btn"
                    onClick={() => handleCloseOrder(order.iqamaNo)}
                    disabled={closeLoading}
                    aria-label={isArabic ? 'إغلاق الطلب' : 'Close order'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="op-side-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
              <p>{isArabic ? 'لا يوجد طلبات نشطة حالياً' : 'No active orders right now'}</p>
            </div>
          )}
        </div>

        {/* close-all footer */}
        {activeOrders.length > 0 && (
          <div className="op-side-footer">
            <button
              className="op-close-all-btn"
              onClick={handleCloseAll}
              disabled={closeLoading}
            >
              {closeLoading ? (
                <span className="op-btn-spinner" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  {t('close_all')}
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* ── styles ── */}
      <style jsx>{`
        /* ── root split layout ───────────────────────────── */
        .op-root {
          display: flex;
          gap: 1.5rem;
          flex: 1 1 0;           /* grow into AuthGuard <main> */
          min-height: 0;         /* allow flex children to shrink/scroll */
          overflow: hidden;
        }

        /* RTL: sidebar on the left side visually = row-reverse puts it last */
        [dir='rtl'].op-root { flex-direction: row-reverse; }
        [dir='ltr'].op-root { flex-direction: row; }

        /* ══════════════════════════════════════════════════
           MAIN PANEL — rider grid
           ══════════════════════════════════════════════════ */
        .op-main {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
        }

        .op-main-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0 0 1.25rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1.25rem;
          flex-shrink: 0;
        }
        .op-main-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.3rem;
        }
        .op-main-hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .op-submit-error {
          padding: 0.65rem 1rem;
          border-radius: 8px;
          background: rgba(186,0,13,0.08);
          color: var(--error);
          border: 1px solid rgba(186,0,13,0.18);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }

        .op-grid-scroll {
          flex: 1 1 0;
          overflow-y: auto;
          padding-bottom: 1rem;
          padding-inline-end: 0.25rem; /* small scrollbar gap */
        }
        .op-grid-scroll::-webkit-scrollbar { width: 5px; }
        .op-grid-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        /* ══════════════════════════════════════════════════
           SIDE PANEL — active orders
           ══════════════════════════════════════════════════ */
        .op-side {
          width: 310px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .op-root {
            flex-direction: column !important;
            overflow: visible;
            min-height: 0;
          }
          .op-side {
            width: 100%;
            max-height: 380px;
          }
          .op-grid-scroll {
            overflow-y: auto;
            max-height: 60vh;
          }
        }
        @media (max-width: 640px) {
          .op-root {
            flex-direction: column !important;
            overflow: visible;
            gap: 1rem;
            padding-bottom: 1rem;
          }
          .op-main-header { padding-bottom: 0.9rem; margin-bottom: 0.9rem; }
          .op-main-title { font-size: 1.15rem; }
          .op-grid-scroll { overflow-y: visible; max-height: none; }
          .op-side { width: 100%; max-height: none; }
        }

        /* side header */
        .op-side-header {
          padding: 1.2rem 1.2rem 0.9rem;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .op-side-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .op-side-title {
          font-size: 1.05rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin: 0;
        }
        .op-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 6px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .op-badge--active {
          background: rgba(0,138,0,0.12);
          color: var(--success);
        }

        .op-refresh-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .op-refresh-btn:hover:not(:disabled) {
          background: rgba(255,153,0,0.08);
          color: var(--primary);
        }
        .op-refresh-btn svg { width: 15px; height: 15px; }
        .op-spinning { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .op-snapshot-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0.4rem 0 0;
        }
        .op-side-error {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          background: rgba(186,0,13,0.08);
          color: var(--error);
          font-size: 0.8rem;
        }

        /* side body */
        .op-side-body {
          flex: 1 1 0;
          overflow-y: auto;
          padding: 0.75rem;
        }
        .op-side-body::-webkit-scrollbar { width: 4px; }
        .op-side-body::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 3px;
        }

        /* order list */
        .op-order-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .op-order-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.8rem 0.9rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: box-shadow 0.15s;
          animation: fadeSlide 0.25s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .op-order-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.07); }

        .op-order-info { flex: 1; min-width: 0; }
        .op-order-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .op-order-meta {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0 0 0.4rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .op-order-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .op-tag {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(0,0,0,0.05);
          color: var(--text-secondary);
        }
        .op-tag--note {
          background: rgba(255,171,0,0.12);
          color: #b37700;
        }

        .op-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: 1px solid rgba(186,0,13,0.2);
          background: rgba(186,0,13,0.06);
          color: var(--error);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
          margin-top: 0.1rem;
        }
        .op-close-btn:hover:not(:disabled) { background: rgba(186,0,13,0.15); }
        .op-close-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .op-close-btn svg { width: 13px; height: 13px; }

        /* loading skeletons */
        .op-side-loading { display: flex; flex-direction: column; gap: 0.6rem; }
        .op-order-skeleton {
          height: 80px;
          border-radius: 10px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* empty state */
        .op-side-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 2.5rem 1rem;
          color: var(--text-secondary);
          text-align: center;
        }
        .op-side-empty svg {
          width: 40px;
          height: 40px;
          opacity: 0.35;
        }
        .op-side-empty p { font-size: 0.85rem; margin: 0; }

        /* footer */
        .op-side-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .op-close-all-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          border: none;
          background: rgba(186,0,13,0.08);
          color: var(--error);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }
        .op-close-all-btn:hover:not(:disabled) { background: rgba(186,0,13,0.16); }
        .op-close-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .op-close-all-btn svg { width: 15px; height: 15px; }

        .op-btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(186,0,13,0.25);
          border-top-color: var(--error);
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          display: inline-block;
        }

        /* ── toast ───────────────────────────────────────── */
        .op-toast {
          position: fixed;
          bottom: max(2rem, env(safe-area-inset-bottom, 2rem));
          left: 50%;
          transform: translateX(-50%);
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 9999;
          pointer-events: none;
          animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
          max-width: 90vw;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }
        .op-toast--success {
          background: var(--secondary);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .op-toast--error {
          background: var(--error);
          color: #fff;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media (max-width: 480px) {
          .op-toast { white-space: normal; font-size: 0.82rem; padding: 0.65rem 1.1rem; }
        }
      `}</style>
    </div>
  );
}
