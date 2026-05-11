'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { apiService } from '@/services/api';
import { Users, Calendar, Clock, AlertCircle, FileSpreadsheet, Upload, Search } from 'lucide-react';

export default function ShiftsPage() {
  const { t, i18n } = useTranslation('common');
  const isArabic = i18n.language === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  // State
  const today = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Import State
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit State
  const [editingShift, setEditingShift] = useState(null); // { riderId, shiftDate, shiftIndex, startTime, durationHours, isBreakDay }

  const fetchShifts = useCallback(async (dateToFetch = currentDate) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getTransporterShiftsByDay(dateToFetch);
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchShifts(currentDate);
  }, [currentDate, fetchShifts]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportLoading(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiService.importTransporterShifts(formData);
      setImportResult({ type: 'success', msg: `Imported! ${res.shiftsCreated || 0} shifts created, ${res.breakDaysMarked || 0} break days.` });
      fetchShifts(currentDate);
      setSelectedFile(null); // Clear selected file after success
    } catch (err) {
      console.error(err);
      setImportResult({ type: 'error', msg: err.message || 'Failed to upload Excel file' });
    } finally {
      setImportLoading(false);
      // Reset input element value so the same file can be chosen again if needed
      const fileInput = document.getElementById('excel-upload');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleMarkBreak = async (riderId) => {
    if (!confirm('Mark as Break Day? This will replace all shifts for this day.')) return;
    try {
      await apiService.markRiderBreakDay(riderId, currentDate);
      fetchShifts(currentDate);
    } catch (err) {
      alert(err.message || 'Error');
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await apiService.deleteShift(shiftId);
      fetchShifts(currentDate);
    } catch (err) {
      alert(err.message || 'Error');
    }
  };

  const saveShift = async () => {
    if (!editingShift) return;
    try {
      await apiService.createOrUpdateShift({
        riderId: editingShift.riderId,
        shiftDate: currentDate,
        shiftIndex: editingShift.shiftIndex,
        startTime: editingShift.startTime || null,
        durationHours: parseFloat(editingShift.durationHours) || 0,
        isBreakDay: editingShift.isBreakDay,
        notes: ''
      });
      setEditingShift(null);
      fetchShifts(currentDate);
    } catch (err) {
      alert(err.message || 'Failed to save shift');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    // Remove seconds if present
    const parts = timeStr.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return timeStr;
  };

  return (
    <div className="shifts-wrapper" dir={dir}>
      <div className="header-row">
        <h1>{t('shifts') || (isArabic ? 'إدارة الورديات' : 'Shift Management')}</h1>
        <div className="header-actions" style={{ alignItems: 'center' }}>
          <input
            type="date"
            className="input-field date-picker"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
          />
          <div className="import-section">
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className={`btn-excel-select ${selectedFile ? 'has-file' : ''}`}
              onClick={() => document.getElementById('excel-upload').click()}
            >
              <FileSpreadsheet size={18} />
              <span>{selectedFile ? selectedFile.name : (isArabic ? 'اختر ملف إكسيل' : 'Choose Excel File')}</span>
            </button>
            <button
              className="btn-import-trigger"
              onClick={handleImport}
              disabled={!selectedFile || importLoading}
            >
              {importLoading ? (
                <div className="spin-inline"></div>
              ) : (
                <Upload size={18} />
              )}
              {importLoading ? (isArabic ? 'جاري...' : 'Importing...') : (isArabic ? 'استيراد' : 'Import')}
            </button>
          </div>
        </div>
      </div>

      {importResult && (
        <div className={`mb-4 alert ${importResult.type === 'error' ? 'error-alert' : 'success-alert'}`}>
          {importResult.msg}
        </div>
      )}

      {error && <div className="error-alert">{error}</div>}

      {loading ? (
        <div className="loading-state">{t('loading') || (isArabic ? 'جاري التحميل...' : 'Loading...')}</div>
      ) : data ? (
        <div className="shifts-content animate-fade-in">
          <div className="stats-grid mb-4">
            {[
              { label: isArabic ? 'إجمالي السائقين' : 'Total Riders', value: data.totalRiders, icon: Users, bgClass: 'bg-blue-gradient' },
              { label: isArabic ? 'لديهم ورديات' : 'With Shifts', value: data.ridersWithShifts, icon: Calendar, bgClass: 'bg-green-gradient' },
              { label: isArabic ? 'في إجازة' : 'On Break', value: data.ridersOnBreak, icon: Clock, bgClass: 'bg-orange-gradient' },
              { label: isArabic ? 'لا توجد بيانات' : 'No Data', value: data.ridersWithNoData, icon: AlertCircle, bgClass: 'bg-red-gradient' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`stat-card ${stat.bgClass}`}>
                  <div className="stat-icon-wrapper">
                    <Icon size={20} color="#fff" />
                  </div>
                  <Icon className="stat-ghost-icon" size={70} color="#fff" />
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="search-bar-container mb-4">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder={isArabic ? 'البحث باسم السائق...' : 'Search by rider name...'}
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card no-pad">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('rider') || (isArabic ? 'السائق' : 'Rider')}</th>
                    <th>{t('status') || (isArabic ? 'الحالة' : 'Status')}</th>
                    <th>{isArabic ? 'الوردية 1' : 'Shift 1'}</th>
                    <th>{isArabic ? 'الوردية 2' : 'Shift 2'}</th>
                    <th>{t('actions') || (isArabic ? 'الإجراءات' : 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.riders?.filter(rider => {
                    const term = searchTerm.toLowerCase();
                    return (rider.nameEN?.toLowerCase().includes(term) || rider.nameAR?.includes(term));
                  }).map(rider => {
                    const shift1 = rider.shifts?.find(s => s.shiftIndex === 1);
                    const shift2 = rider.shifts?.find(s => s.shiftIndex === 2);

                    const renderShiftCell = (shift, index) => {
                      if (!shift) {
                        return (
                          <div className="empty-shift">
                            <span className="text-tertiary">--</span>
                            <button
                              className="btn-link"
                              onClick={() => setEditingShift({ riderId: rider.riderId, shiftIndex: index, startTime: '08:00', durationHours: 8, isBreakDay: false })}
                            >{isArabic ? '+ إضافة' : '+ Add'}</button>
                          </div>
                        );
                      }
                      return (
                        <div className="shift-block">
                          {shift.isBreakDay ? (
                            <span className="badge badge-break">{isArabic ? 'إجازة' : 'Break'}</span>
                          ) : (
                            <>
                              <div className="shift-time">{formatTime(shift.startTime)} <span className="text-secondary text-sm">({shift.durationHours}h)</span></div>
                              {shift.isManuallyEdited && <span className="badge badge-edited" title="Manually Edited">M</span>}
                            </>
                          )}
                          <div className="shift-actions">
                            <button className="icon-btn text-accent" onClick={() => setEditingShift({ ...shift, riderId: rider.riderId })} title="Edit">✎</button>
                            <button className="icon-btn text-error" onClick={() => handleDeleteShift(shift.id)} title="Delete">✕</button>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <tr key={rider.riderId}>
                        <td>
                          <div className="font-medium">{isArabic ? rider.nameAR : rider.nameEN}</div>
                          <div className="text-sm text-secondary">{rider.workingId}</div>
                        </td>
                        <td>
                          {rider.isBreakDay ? <span className="status-badge idle">{isArabic ? 'في إجازة' : 'On Break'}</span> :
                            rider.hasShift ? <span className="status-badge active">{isArabic ? 'يعمل' : 'Working'}</span> :
                              <span className="status-badge">{t('no_data') || (isArabic ? 'لا توجد بيانات' : 'No Data')}</span>}
                        </td>
                        <td>{renderShiftCell(shift1, 1)}</td>
                        <td>{renderShiftCell(shift2, 2)}</td>
                        <td>
                          {!rider.isBreakDay && (
                            <button className="btn-outline-small" onClick={() => handleMarkBreak(rider.riderId)}>
                              {isArabic ? 'تعيين كإجازة' : 'Mark Break'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editingShift && (
        <div className="modal-overlay" onClick={() => setEditingShift(null)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4">{isArabic ? 'تعديل الوردية' : 'Edit Shift'} {editingShift.shiftIndex}</h3>

            <div className="form-group mb-3">
              <label>{isArabic ? 'هل هو يوم إجازة؟' : 'Is Break Day?'}</label>
              <div style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={editingShift.isBreakDay}
                  onChange={(e) => setEditingShift({ ...editingShift, isBreakDay: e.target.checked })}
                /> <span style={{ marginInlineStart: '0.5rem' }}>{isArabic ? 'نعم، هذه الفترة إجازة.' : 'Yes, this block is a break.'}</span>
              </div>
            </div>

            {!editingShift.isBreakDay && (
              <>
                <div className="form-group mb-3">
                  <label>{isArabic ? 'وقت البدء' : 'Start Time'}</label>
                  <input
                    type="time"
                    className="input-field"
                    value={editingShift.startTime || ''}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                  />
                  <small className="text-secondary mt-1 block">{isArabic ? 'اتركه فارغاً لوردية مرنة' : 'Leave empty for floating shift'}</small>
                </div>
                <div className="form-group mb-4">
                  <label>{isArabic ? 'المدة (ساعات)' : 'Duration (Hours)'}</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={editingShift.durationHours}
                    onChange={(e) => setEditingShift({ ...editingShift, durationHours: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-outline-small" onClick={() => setEditingShift(null)}>{t('cancel') || (isArabic ? 'إلغاء' : 'Cancel')}</button>
              <button className="btn-primary" onClick={saveShift}>{isArabic ? 'حفظ الوردية' : 'Save Shift'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .shifts-wrapper { padding: 1rem 0; width: 100%; max-width: 1200px; margin: 0 auto; }
        .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .header-actions { display: flex; gap: 1rem; align-items: center; }
        
        /* ── Stats Grid ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          position: relative;
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          overflow: hidden;
          box-shadow: var(--shadow);
          color: #fff;
        }
        .bg-blue-gradient { background: linear-gradient(135deg, var(--accent), #1A44B8); }
        .bg-orange-gradient { background: linear-gradient(135deg, #f59e0b, #f97316); }
        .bg-green-gradient { background: linear-gradient(135deg, #10b981, #059669); }
        .bg-red-gradient { background: linear-gradient(135deg, var(--error), #990013); }
        .stat-icon-wrapper { background: rgba(255, 255, 255, 0.15); width: fit-content; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.75rem; }
        .stat-ghost-icon { position: absolute; left: -1rem; bottom: -1rem; opacity: 0.2; transform: rotate(12deg); }
        .stat-content { position: relative; z-index: 10; }
        .stat-content h3 { font-size: 1.75rem; margin: 0 0 0.25rem; font-weight: 800; line-height: 1.1; }
        .stat-content p { margin: 0; font-size: 0.875rem; font-weight: 500; opacity: 0.95; }
        .date-picker { max-width: 200px; padding: 0.5rem 1rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 1rem; }
        .mb-4 { margin-bottom: 1.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1.5rem; }
        .flex { display: flex; }
        .gap-2 { gap: 0.5rem; }
        .justify-end { justify-content: flex-end; }
        .text-sm { font-size: 0.8rem; }
        .block { display: block; }
        .text-error { color: var(--error); }
        .no-pad { padding: 0; overflow: hidden; }

        .import-card { margin-bottom: 2rem; background: var(--surface-2); }
        .json-input { font-family: monospace; font-size: 0.8rem; }
        .success-alert { background: var(--success-light); color: var(--success); padding: 0.8rem 1.1rem; border-radius: var(--radius); font-weight: 500; font-size: 0.875rem; }
        
        .empty-shift { display: flex; justify-content: space-between; align-items: center; opacity: 0.6; }
        .btn-link { background: none; border: none; color: var(--accent); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline; }
        
        .shift-block { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.6rem; background: var(--background); border-radius: 6px; border: 1px solid var(--border); min-width: 140px; }
        .shift-time { font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; }
        .shift-actions { display: flex; gap: 0.3rem; opacity: 0; transition: opacity 0.2s; }
        .shift-block:hover .shift-actions { opacity: 1; }
        
        .icon-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(0,0,0,0.05); }

        .badge { padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .badge-break { background: rgba(107,112,128,0.15); color: var(--text-secondary); }
        .badge-edited { background: var(--primary-light); color: var(--primary); margin-left: 0.4rem; }

        .btn-outline-small { background: transparent; border: 1px solid var(--border-strong); color: var(--text); padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-outline-small:hover { background: var(--surface-2); border-color: var(--text); }

        /* ── Import Section Styling ── */
        .import-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.5);
          padding: 0.35rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .btn-excel-select {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--surface);
          border: 1.5px dashed var(--border-strong);
          color: var(--text-secondary);
          padding: 0.5rem 1.25rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s;
          min-height: 42px;
          white-space: nowrap;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .btn-excel-select:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(0, 112, 192, 0.04);
          transform: translateY(-1px);
        }
        .btn-excel-select.has-file {
          border-style: solid;
          border-color: var(--success);
          color: var(--success);
          background: var(--success-light);
        }
        .btn-import-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: #000;
          padding: 0.5rem 1.5rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.22s;
          min-height: 42px;
          border: none;
          box-shadow: 0 4px 12px rgba(255, 153, 0, 0.2);
        }
        .btn-import-trigger:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 153, 0, 0.3);
        }
        .btn-import-trigger:disabled {
          background: var(--surface-2);
          color: var(--text-tertiary);
          box-shadow: none;
          cursor: not-allowed;
        }
        .spin-inline {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(0,0,0,0.1);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(2px); }
        .modal-content { width: 100%; max-width: 400px; box-shadow: var(--shadow-xl); }

        /* ── Search Bar ── */
        .search-bar-container {
          display: flex;
          width: 100%;
        }
        .search-input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        [dir='rtl'] .search-icon {
          left: auto;
          right: 1rem;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-size: 0.95rem;
          transition: all 0.2s;
          color: var(--text);
        }
        [dir='rtl'] .search-input {
          padding: 0.75rem 2.75rem 0.75rem 1rem;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0, 112, 192, 0.1);
          background: #fff;
        }
      `}</style>
    </div>
  );
}
