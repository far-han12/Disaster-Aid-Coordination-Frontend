const API_URL = 'http://localhost:4000/api/v1'; // Your backend URL

const request = async (endpoint, options = {}) => {
  const { body, token, ...customConfig } = options;
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
  } catch (err) {
    console.error('API call error:', err);
    throw err;
  }
};

export const api = {
  // === Auth ===
  login: (email, password) => request('/auth/login', { body: { email, password } }),
  signup: (userData) => request('/auth/signup', { body: userData }),
  getMe: (token) => request('/users/me', { token }),

  // === Aid Requests ===
  getAidRequests: (params = {}) => request(`/requests?${new URLSearchParams(params).toString()}`),
  getMyRequests: (token) => request('/requests/my-requests', { token }),
  createAidRequest: (data, token) => request('/requests', { body: data, token }),
  
  // === Resources ===
  createResource: (data, token) => request('/resources', { body: data, token }),

  // === Assignments ===
  assignVolunteer: (data, token) => request('/assignments', { body: data, token }),
  getMyAssignments: (token) => request('/assignments/my-assignments', { token }),
  
  // === Admin ===
  getAllUsers: (token) => request('/admin/users', { token }),
  updateUserRole: (id, role, token) => request(`/admin/users/${id}`, { method: 'PATCH', body: { role }, token }),
  deleteUser: (id, token) => request(`/admin/users/${id}`, { method: 'DELETE', token }),
  deleteAidRequest: (id, token) => request(`/admin/requests/${id}`, { method: 'DELETE', token }),
  getAidTypeSummary: (token) => request('/admin/analytics/summary', { token }),
  findMatchingResources: (requestId, token) => request(`/admin/requests/${requestId}/matches`, { token }),
  updateRequestUrgency: (id, urgency, token) => request(`/admin/requests/${id}/urgency`, { method: 'PATCH', body: { urgency }, token }),
   getAllUsers: (token, search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/admin/users${query}`, { token });
  },
};
