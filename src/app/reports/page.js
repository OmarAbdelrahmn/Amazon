'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiService } from '@/services/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  Activity,
  Package,
} from 'lucide-react';

// ─── Shared sub-components ──────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, backgroundClass }) => (
  <div className={`stat-card ${backgroundClass}`}>
    <div className="stat-icon-wrapper">
      <Icon size={24} strokeWidth={2.5} color="#ffffff" />
    </div>
    <Icon className="stat-ghost-icon" size={80} color="#ffffff" />
    <div className="stat-content">
      <h3>{value ?? '—'}</h3>
      <p>{title}</p>
      {subtitle && <span className="stat-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>{subtitle}</span>}
    </div>
  </div>
);

const DetailCard = ({ title, children }) => (
  <div className="glass-card detail-card">
    {title && (
      <h3 className="detail-card-title">
        {title}
      </h3>
    )}
    {children}
  </div>
);

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`tab-btn ${active ? 'active' : ''}`}
    style={{ color: active ? '#4c00ffff' : 'var(--text-secondary)' }}
  >
    {children}
  </button>
);

const ActionBtn = ({ children, onClick, disabled, className = 'btn-primary' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={className}
    style={{ 
      minWidth: '180px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem'
    }}
  >
    {children}
  </button>
);

const DataTable = ({ headers, rows }) => (
  <div className="table-wrap table-overflow">
    <table className="data-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
              لا توجد بيانات
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const GenericTable = ({ dataArray }) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0)
    return <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>لا توجد بيانات</p>;
  const keys = Object.keys(dataArray[0]);
  return (
    <DataTable
      headers={keys}
      rows={dataArray.map((row) =>
        keys.map((k) =>
          typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '')
        )
      )}
    />
  );
};

const ShiftReportTable = ({ riders, isArabic }) => {
  if (!riders || riders.length === 0) {
    return <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>لا توجد بيانات</p>;
  }

  const headers = isArabic
    ? ['رقم الإقامة', 'الاسم', 'أيام العمل', 'أيام الإجازة', 'أيام بلا بيانات', 'ساعات الجدول']
    : ['Iqama No', 'Name', 'Working Days', 'Break Days', 'No Data Days', 'Scheduled Hours'];

  const rows = riders.map(r => [
    r.riderId || r.workingId || '—',
    isArabic ? r.nameAR : r.nameEN,
    r.totalWorkingDays ?? 0,
    r.totalBreakDays ?? 0,
    r.totalDaysWithNoData ?? 0,
    r.totalHoursScheduled ?? 0,
  ]);

  return <DataTable headers={headers} rows={rows} />;
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { t, i18n } = useTranslation('common');
  const isArabic = i18n.language === 'ar';

  const today = new Date().toISOString().split('T')[0];

  // ── Order report state ──
  const [activeTab, setActiveTab] = useState('orders');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Shift report state ──
  const [shiftYear, setShiftYear] = useState(new Date().getFullYear());
  const [shiftMonth, setShiftMonth] = useState(new Date().getMonth() + 1);
  const [shiftData, setShiftData] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftError, setShiftError] = useState('');

  // ── Handlers ──
  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const reportData = await apiService.getRangeReport(
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`
      );
      setData(reportData);
    } catch (err) {
      setError(err.title || err.message || 'Failed to generate report.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftReport = async () => {
    setShiftLoading(true);
    setShiftError('');
    try {
      const reportData = await apiService.getAllRidersMonthlyShifts(shiftYear, shiftMonth);
      setShiftData(reportData);
    } catch (err) {
      setShiftError(err.title || err.message || 'Failed to generate shift report.');
      setShiftData(null);
    } finally {
      setShiftLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="reports-container" dir={isArabic ? 'rtl' : 'ltr'}>


      {/* ── Filter Section ── */}
      <div className="filters-section">
        {activeTab === 'orders' ? (
          <div className="glass-card filter-card">
            <h3 className="filter-title">
              <FileText size={18} color="var(--accent)" />
              تحديد نطاق التقرير
            </h3>
            <div className="filter-controls">
              <div className="input-group">
                <label>{t('start_date')}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label>{t('end_date')}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <ActionBtn
                onClick={fetchReport}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Activity size={16} className="spin-icon" /> {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </>
                ) : (
                  <>
                    <BarChart3 size={16} /> {t('generate_report')}
                  </>
                )}
              </ActionBtn>
            </div>
          </div>
        ) : (
          <div className="glass-card filter-card">
            <h3 className="filter-title">
              <Calendar size={18} color="var(--accent)" />
              تحديد الفترة الزمنية
            </h3>
            <div className="filter-controls">
              <div className="input-group">
                <label>{isArabic ? 'السنة' : 'Year'}</label>
                <input
                  type="number"
                  value={shiftYear}
                  onChange={(e) => setShiftYear(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="input-group">
                <label>{isArabic ? 'الشهر' : 'Month'}</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={shiftMonth}
                  onChange={(e) => setShiftMonth(e.target.value)}
                  className="input-field"
                />
              </div>
              <ActionBtn onClick={fetchShiftReport} disabled={shiftLoading} className="btn-primary btn-orange">
                {shiftLoading ? (
                  <>
                    <Activity size={16} className="spin-icon" /> جاري التحميل...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} /> {t('generate_report')}
                  </>
                )}
              </ActionBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Tab switcher (Moved below filters) ── */}
      <div className="tabs-outer">
        <div className="tabs-container">
          <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            <Package size={16} />
            {isArabic ? 'تقارير الطلبات' : 'Order Reports'}
          </TabBtn>
          <TabBtn active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')}>
            <Calendar size={16} />
            {isArabic ? 'تقارير الورديات' : 'Shift Reports'}
          </TabBtn>
        </div>
      </div>

      {/* ── Results Section ── */}
      <div className="results-section">
        {activeTab === 'orders' ? (
          <>
            {/* Error */}
            {error && (
              <div className="error-alert flex-items-center mb-6">
                <AlertTriangle size={18} />
                <span style={{ marginInlineStart: '10px' }}>{error}</span>
              </div>
            )}

            {/* Results */}
            {data && (
              <div className="animate-fade-in results-container">

                {/* Two detail cards */}
                <div className="details-grid">
                  <DetailCard title="التفاصيل اليومية">
                    <DataTable
                      headers={[t('date'), t('total_orders'), t('active_employees'), t('total_minutes')]}
                      rows={(data.daySummaries ?? []).map((day) => [
                        day.date,
                        day.totalOrders,
                        day.activeEmployees,
                        day.totalMinutesWorked?.toFixed(1) ?? 0,
                      ])}
                    />
                  </DetailCard>
                  <DetailCard title="أبرز الموظفين">
                    <DataTable
                      headers={[t('iqama_no'), t('employees'), t('orders'), t('days_active'), t('total_minutes')]}
                      rows={(data.employeeSummaries ?? []).map((emp) => [
                        emp.iqamaNo,
                        isArabic ? emp.nameAR : emp.nameEN,
                        <span key="badge" className="status-badge active">{emp.totalOrders}</span>,
                        emp.daysActive,
                        emp.totalMinutesOnOrder?.toFixed(1) ?? 0,
                      ])}
                    />
                  </DetailCard>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Error */}
            {shiftError && (
              <div className="error-alert flex-items-center mb-6">
                <AlertTriangle size={18} />
                <span style={{ marginInlineStart: '10px' }}>{shiftError}</span>
              </div>
            )}

            {/* Results */}
            {shiftData && (
              <div className="animate-fade-in results-container">

                <DetailCard title={isArabic ? 'تقرير الورديات الشهري' : 'Monthly Shift Report'}>
                  {Array.isArray(shiftData) ? (
                    <ShiftReportTable riders={shiftData} isArabic={isArabic} />
                  ) : shiftData.riders ? (
                    <ShiftReportTable riders={shiftData.riders} isArabic={isArabic} />
                  ) : (
                    <ShiftReportTable
                      riders={Object.values(shiftData).find(Array.isArray) ?? []}
                      isArabic={isArabic}
                    />
                  )}
                </DetailCard>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── styles ── */}
      <style jsx>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          padding: 0.5rem;
        }
        .logo-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .header-left h1 {
          margin: 0 0 0.2rem;
          color: var(--text);
        }
        .header-left p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .tabs-outer {
          display: flex;
          justify-content: center;
          margin: 0rem 0 2rem;
        }
        .tabs-container {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 50px;
          border: 1px solid var(--border);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
          width: fit-content;
          gap: 1.5rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 2.5rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
          white-space: nowrap;
          min-width: 180px;
        }
        .tab-btn:hover:not(.active) {
          color: var(--accent);
          background: rgba(0, 112, 192, 0.05);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, var(--accent), #1A44B8);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 112, 192, 0.3);
          transform: scale(1.05);
        }

        .filter-card {
          margin-bottom: 1.5rem;
          background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 8px);
        }
        .filter-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.25rem;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 1rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
          min-width: 160px;
        }
        .input-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mb-6 {
          margin-bottom: 1.5rem;
        }
        .flex-items-center {
          display: flex;
          align-items: center;
        }

        .results-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .reports-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          position: relative !important;
          border-radius: var(--radius-lg) !important;
          padding: 1.75rem !important;
          overflow: hidden !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          color: #ffffff !important;
          min-height: 140px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          border: none !important;
        }
        .bg-blue-gradient { background: linear-gradient(135deg, #0070c0 0%, #004a80 100%) !important; }
        .bg-orange-gradient { background: linear-gradient(135deg, #ff9900 0%, #cc7a00 100%) !important; }
        .bg-green-gradient { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important; }
        .bg-red-gradient { background: linear-gradient(135deg, #dc3545 0%, #a71d2a 100%) !important; }

        .stat-icon-wrapper {
          background: rgba(255, 255, 255, 0.25);
          width: fit-content;
          padding: 0.6rem;
          border-radius: 12px;
          margin-bottom: 0.8rem;
          position: relative;
          z-index: 2;
        }
        .stat-ghost-icon {
          position: absolute;
          right: -0.75rem;
          bottom: -0.75rem;
          opacity: 0.2;
          transform: rotate(-15deg);
          z-index: 1;
        }
        [dir='rtl'] .stat-ghost-icon {
          right: auto;
          left: -0.75rem;
          transform: rotate(15deg);
        }

        .btn-generate {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.65rem 1.25rem;
          min-height: 44px;
          border-radius: var(--radius);
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.02em;
          gap: 0.5rem;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), #1A44B8);
          box-shadow: 0 4px 12px rgba(0, 112, 192, 0.25);
        }
        .btn-generate:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 16px rgba(0, 112, 192, 0.4);
        }
        .btn-generate:active { transform: translateY(0) scale(1); }
        .btn-generate:disabled { opacity: 0.7; pointer-events: none; }
        .stat-content {
          position: relative;
          z-index: 10;
        }
        .stat-content h3 {
          font-size: 2.4rem;
          margin: 0;
          font-weight: 800;
          line-height: 1;
        }
        .stat-content p {
          margin: 0.3rem 0 0;
          font-size: 0.95rem;
          font-weight: 600;
          opacity: 0.95;
        }
        .stat-subtitle {
          display: block;
          font-size: 0.65rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .details-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .detail-card {
          background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 8px);
        }
        .detail-card-title {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1.25rem;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .btn-orange {
          background: linear-gradient(135deg, #f59e0b, #f97316) !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25) !important;
          color: white !important;
        }
        .btn-orange:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35) !important;
        }

      `}</style>
    </div>
  );
}