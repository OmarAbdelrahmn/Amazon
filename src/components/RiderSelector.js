'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';

/**
 * RiderSelector — instant-send mode
 *
 * Props:
 *   onSelect(rider, note) — fired immediately when a rider card is clicked;
 *                           the parent is responsible for calling createOrder.
 *   submittingId          — iqamaNo of the card currently being submitted (shows spinner)
 *   successId             — iqamaNo of the last successfully submitted card (shows green flash)
 *   externalRiders        — if provided, skip internal fetch and use this array
 *   loadingExternal       — if true (and externalRiders provided), show skeleton
 */
export default function RiderSelector({
  onSelect,
  submittingId = null,
  successId = null,
  externalRiders = null,
  loadingExternal = false,
}) {
  const { t, i18n } = useTranslation('common');
  const isRtl = i18n.language === 'ar';

  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({}); // { [iqamaNo]: string }

  /* ── fetch (only when no external data provided) ─────────────── */
  useEffect(() => {
    if (externalRiders !== null) return; // parent controls the data
    (async () => {
      try {
        const data = await apiService.getEmployees();
        setRiders(data);
      } catch (err) {
        setError(err.message || 'Failed to load riders');
      } finally {
        setLoading(false);
      }
    })();
  }, [externalRiders]);

  const displayRiders = externalRiders ?? riders;
  const isLoading = externalRiders !== null ? loadingExternal : loading;

  /* ── helpers ──────────────────────────────────────────────────── */
  const handleNote = (id, value) =>
    setNotes(prev => ({ ...prev, [id]: value }));

  const handleClick = (rider) => {
    if (submittingId) return; // block while any card is in-flight
    onSelect?.(rider, notes[rider.iqamaNo] || '');
  };

  const avatarSrc = (rider) => {
    if (!rider.profileImagePath) return null;
    return rider.profileImagePath.startsWith('http')
      ? rider.profileImagePath
      : `${BASE_URL}/${rider.profileImagePath.replace(/^\//, '')}`;
  };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="rs-wrapper" dir={isRtl ? 'rtl' : 'ltr'}>
      {error && <div className="rs-error">{error}</div>}

      {isLoading ? (
        <div className="rs-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rs-skeleton" />
          ))}
        </div>
      ) : displayRiders.length === 0 ? (
        <div className="rs-empty">{t('no_data')}</div>
      ) : (
        <div className="rs-grid">
          {displayRiders.map(rider => {
            const imgSrc = avatarSrc(rider);
            const isSubmitting = submittingId === rider.iqamaNo;
            const isSuccess = successId === rider.iqamaNo;
            const isDisabled = !!submittingId && !isSubmitting;

            return (
              <div
                key={rider.iqamaNo}
                className={[
                  'rs-card',
                  isSubmitting ? 'rs-card--submitting' : '',
                  isSuccess ? 'rs-card--success' : '',
                  isDisabled ? 'rs-card--dimmed' : '',
                ].join(' ')}
              >
                {/* ── clickable image area ── */}
                <button
                  type="button"
                  className="rs-img-btn"
                  onClick={() => handleClick(rider)}
                  disabled={isSubmitting || isDisabled}
                  aria-label={`${rider.nameAR} / ${rider.nameEN}`}
                >
                  <div className="rs-img-wrap">
                    {/* avatar or initials */}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={rider.nameEN}
                        className="rs-avatar"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="rs-initials"
                      style={{ display: imgSrc ? 'none' : 'flex' }}
                    >
                      {rider.nameEN?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    {/* overlay: spinner or success tick */}
                    {(isSubmitting || isSuccess) && (
                      <div className={`rs-overlay ${isSuccess ? 'rs-overlay--success' : ''}`}>
                        {isSubmitting ? (
                          <div className="rs-spinner" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* names */}
                  <div className="rs-names">
                    <span className="rs-name-ar">{rider.nameAR}</span>
                    <span className="rs-name-en">{rider.nameEN}</span>
                  </div>
                </button>

                {/* ── optional note textarea ── */}
                <div className="rs-note-wrap">
                  <textarea
                    className="rs-note"
                    rows={2}
                    value={notes[rider.iqamaNo] || ''}
                    onChange={e => handleNote(rider.iqamaNo, e.target.value)}
                    disabled={isSubmitting || isDisabled}
                    placeholder={
                      isRtl
                        ? 'ملاحظة اختيارية لهذا الطلب'
                        : 'Optional note for this order'
                    }
                    onClick={e => e.stopPropagation()}
                    aria-label={isRtl ? 'ملاحظة اختيارية' : 'Optional note'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .rs-wrapper { width: 100%; }

        /* ── grid ───────────────────────────────────────── */
        .rs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .rs-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
        }
        @media (max-width: 380px) {
          .rs-grid { grid-template-columns: 1fr; gap: 0.6rem; }
        }

        /* ── card ────────────────────────────────────────── */
        .rs-card {
          border: 2px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          background: var(--surface);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, opacity 0.2s;
        }
        .rs-card:not(.rs-card--dimmed):not(.rs-card--submitting):hover {
          border-color: var(--primary);
          box-shadow: 0 6px 20px rgba(255, 153, 0, 0.18);
          transform: translateY(-3px);
        }
        .rs-card--submitting {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255,153,0,0.25);
          pointer-events: none;
        }
        .rs-card--success {
          border-color: var(--success);
          box-shadow: 0 0 0 3px rgba(0,138,0,0.2);
          animation: successPulse 0.5s ease;
        }
        @keyframes successPulse {
          0%  { transform: scale(1);    }
          40% { transform: scale(1.04); }
          100%{ transform: scale(1);    }
        }
        .rs-card--dimmed {
          opacity: 0.45;
          pointer-events: none;
        }

        /* ── image button ────────────────────────────────── */
        .rs-img-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.2rem 1rem 0.6rem;
          width: 100%;
          cursor: pointer;
          background: none;
          border: none;
          gap: 0.6rem;
          transition: background 0.15s;
        }
        .rs-img-btn:not(:disabled):hover { background: rgba(255,153,0,0.04); }
        .rs-img-btn:focus-visible {
          outline: 3px solid var(--primary);
          outline-offset: -3px;
        }
        .rs-img-btn:disabled { cursor: not-allowed; }

        /* ── image wrap ──────────────────────────────────── */
        .rs-img-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
        }
        .rs-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          border: 3px solid var(--border);
        }

        /* ── initials fallback ───────────────────────────── */
        .rs-initials {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--secondary), var(--accent));
          color: #fff;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--border);
        }

        /* ── overlay (spinner / tick) ────────────────────── */
        .rs-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .rs-overlay--success {
          background: rgba(0,138,0,0.75);
          animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rs-overlay svg { width: 28px; height: 28px; }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* ── spinner ─────────────────────────────────────── */
        .rs-spinner {
          width: 26px;
          height: 26px;
          border: 3px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── names ───────────────────────────────────────── */
        .rs-names {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
        }
        .rs-name-ar {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1.3;
          direction: rtl;
        }
        .rs-name-en {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
          direction: ltr;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        /* ── note ────────────────────────────────────────── */
        .rs-note-wrap { padding: 0 0.7rem 0.8rem; }
        .rs-note {
          width: 100%;
          resize: none;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-family: inherit;
          font-size: 0.76rem;
          line-height: 1.5;
          padding: 0.45rem 0.6rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rs-note:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255,153,0,0.15);
        }
        .rs-note:disabled { opacity: 0.5; cursor: not-allowed; }
        .rs-note::placeholder { color: var(--text-secondary); opacity: 0.7; font-size: 0.72rem; }

        /* ── skeleton ────────────────────────────────────── */
        .rs-skeleton {
          height: 210px;
          border-radius: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── error / empty ───────────────────────────────── */
        .rs-error {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(186,0,13,0.08);
          color: var(--error);
          border: 1px solid rgba(186,0,13,0.2);
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .rs-empty {
          text-align: center;
          color: var(--text-secondary);
          padding: 3rem 1rem;
        }
      `}</style>
    </div>
  );
}
