const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';

const fetchAPI = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // For demonstration, retrieve token from localStorage if available, or use a mock token
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers,
  };

  // If body is FormData, browser needs to set Content-Type with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid or expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    const errorMessage = errorData.detail || errorData.message || errorData.title || 'API request failed';
    
    const error = new Error(errorMessage);
    error.status = response.status || errorData.status;
    error.title = errorData.title;
    error.type = errorData.type;
    error.data = errorData;
    
    throw error;
  }

  return response.json();
};

export const apiService = {
  // Auth
  login: async (credentials) => {
    const url = `${BASE_URL}/api/Auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.message || errorData.title || 'Login failed';
      throw new Error(errorMessage);
    }
    // Read response text first in case it returns a plain string token
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text; // Return raw string if not JSON
    }
  },

  // Employees
  getEmployees: () => fetchAPI('/api/order/employees'),
  getEmployee: (iqamaNo) => fetchAPI(`/api/order/employees/${iqamaNo}`),
  getEmployeeHistory: (iqamaNo) => fetchAPI(`/api/order/employees/${iqamaNo}/history`),

  // Orders
  createOrder: (data) => fetchAPI('/api/order', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  closeOrder: (iqamaNo) => fetchAPI(`/api/order/close/${iqamaNo}`, {
    method: 'PATCH',
  }),
  closeAllOrders: () => fetchAPI('/api/order/close-all', {
    method: 'PATCH',
  }),
  getActiveOrders: () => fetchAPI('/api/order/active'),

  // Reports
  getTodayReport: () => fetchAPI('/api/order/report/today'),
  getDailyReport: (date) => fetchAPI(`/api/order/report/daily?date=${date}`),
  getRangeReport: (start, end) => fetchAPI(`/api/order/report/range?start=${start}&end=${end}`),
  getStatistics: () => fetchAPI('/api/order/report/statistics'),

  // Dispatch
  getDispatchNow: () => fetchAPI('/api/order/dispatch/now'),
  getDispatch: (date, time) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    const qs = params.toString();
    return fetchAPI(`/api/order/dispatch${qs ? `?${qs}` : ''}`);
  },
  getDispatchAll: (date) => fetchAPI(`/api/order/dispatch/all${date ? `?date=${date}` : ''}`),

  // Transporter Shifts
  importTransporterShifts: (formData) => fetchAPI('/api/transporter-shifts/upload', {
    method: 'POST',
    body: formData,
  }),
  getTransporterShiftsByDay: (date) => fetchAPI(`/api/transporter-shifts/day?date=${date}`),
  getTransporterShiftsToday: () => fetchAPI('/api/transporter-shifts/day/today'),
  getTransporterShiftsActive: (date, time) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    const qs = params.toString();
    return fetchAPI(`/api/transporter-shifts/active${qs ? `?${qs}` : ''}`);
  },
  getRiderMonthlyShifts: (riderId, year, month) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const qs = params.toString();
    return fetchAPI(`/api/transporter-shifts/riders/${riderId}/monthly${qs ? `?${qs}` : ''}`);
  },
  getAllRidersMonthlyShifts: (year, month) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const qs = params.toString();
    return fetchAPI(`/api/transporter-shifts/monthly${qs ? `?${qs}` : ''}`);
  },
  createOrUpdateShift: (data) => fetchAPI('/api/transporter-shifts/shifts', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patchShiftTimes: (shiftId, data) => fetchAPI(`/api/transporter-shifts/shifts/${shiftId}/times`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteShift: (shiftId) => fetchAPI(`/api/transporter-shifts/shifts/${shiftId}`, {
    method: 'DELETE',
  }),
  markRiderBreakDay: (riderId, date) => fetchAPI(`/api/transporter-shifts/riders/${riderId}/break?date=${date}`, {
    method: 'POST',
  }),
};
