const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';

const fetchAPI = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // For demonstration, retrieve token from localStorage if available, or use a mock token
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
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

    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || error.detail || 'API request failed');
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
    if (!response.ok) throw new Error('Login failed');
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
};
