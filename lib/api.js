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
createMyContactInfo: (data, token) => request('/users/me/contact-info', { body: data, token }), 
  getMyContactInfo: (token) => request('/users/me/contact-info', { token }), // Add this line

// ...
  // === Aid Requests ===
  getAidRequests: (params = {}) => request(`/requests?${new URLSearchParams(params).toString()}`),
  getMyRequests: (token) => request('/requests/my-requests', { token }),
  createAidRequest: (data, token) => request('/requests', { body: data, token }),
    updateAidRequest: (id, data, token) => request(`/requests/${id}`, { method: 'PATCH', body: data, token }),
  deleteAidRequestss: (id, token) => request(`/requests/${id}`, { method: 'DELETE', token }),
  // === Resources ===
  createResource: (data, token) => request('/resources', { body: data, token }),
  getMyResources: (token) => request('/resources/my-resources', { token }),
  updateResource: (id, data, token) => request(`/resources/${id}`, { method: 'PATCH', body: data, token }),
  deleteResource: (id, token) => request(`/resources/${id}`, { method: 'DELETE', token }),

  // === Assignments ===
  assignVolunteer: (data, token) => request('/assignments', { body: data, token }),
  getMyAssignments: (token) => request('/assignments/my-assignments', { token }),
   completeAssignment: (assignmentId, token) => request(`/assignments/${assignmentId}/complete`, { method: 'PUT', token }), // Add this line
  // === Matches ===
  findNewMatches: (token) => request('/matches/find', { method: 'POST', token }),
  getPendingMatches: (token) => request('/matches/pending', { token }),
  confirmMatch: (matchId, volunteerId, token) => request(`/matches/${matchId}/confirm`, {
    method: 'POST',
    body: { volunteerId },
    token,
  }),
  
  // === Admin ===
  getAllUsers: (token, search = '') => request(`/admin/users?search=${encodeURIComponent(search)}`, { token }),
  updateUserRole: (id, role, token) => request(`/admin/users/${id}`, { method: 'PATCH', body: { role }, token }),
  deleteUser: (id, token) => request(`/admin/users/${id}`, { method: 'DELETE', token }),
  deleteAidRequest: (id, token) => request(`/admin/requests/${id}`, { method: 'DELETE', token }),
  getAidTypeSummary: (token) => request('/admin/analytics/summary', { token }),
  findMatchingResources: (requestId, ctoken) => request(`/admin/requests/${requestId}/matches`, { token }),
  updateRequestUrgency: (id, urgency, token) => request(`/admin/requests/${id}/urgency`, { method: 'PATCH', body: { urgency }, token }),
  adminGetAllResources: (token, search = '') => request(`/admin/resources?search=${encodeURIComponent(search)}`, { token }),
  adminUpdateResource: (id, data, token) => request(`/admin/resources/${id}`, { method: 'PATCH', body: data, token }),
  adminDeleteResource: (id, token) => request(`/admin/resources/${id}`, { method: 'DELETE', token }),
   getPlatformStats: (token) => request('/admin/stats', { token }),
     adminUpdateAidRequest: (id, data, token) => request(`/admin/requests/${id}`, { method: 'PATCH', body: data, token }),



};
