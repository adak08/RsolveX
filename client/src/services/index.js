import api from '../api/axios';
import { API_ENDPOINTS } from '../constants';

// ─── Auth Services ───────────────────────────────────────────────────────────

export const authService = {
  userSignup: (data) => api.post(API_ENDPOINTS.USER_SIGNUP, data),
  userLogin: (data) => api.post(API_ENDPOINTS.USER_LOGIN, data),
  staffLogin: (data) => api.post(API_ENDPOINTS.STAFF_LOGIN, data),
  staffRegister: (data) => api.post(API_ENDPOINTS.STAFF_REGISTER, data),
  adminLogin: (data) => api.post(API_ENDPOINTS.ADMIN_LOGIN, data),
  logout: () => api.post('/api/users/logout'),
  getProfile: () => api.get(API_ENDPOINTS.USER_PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.USER_PROFILE, data),
  refreshToken: () => api.post('/api/users/refresh-token'),
};

export const otpService = {
  request: (data) => api.post(API_ENDPOINTS.OTP_REQUEST, data),
  verify: (data) => api.post(API_ENDPOINTS.OTP_VERIFY, data),
  resend: (data) => api.post(API_ENDPOINTS.OTP_RESEND, data),
  signupUser: (data) => api.post(API_ENDPOINTS.OTP_SIGNUP_USER, data),
  loginUser: (data) => api.post(API_ENDPOINTS.OTP_LOGIN_USER, data),
  loginStaff: (data) => api.post(API_ENDPOINTS.OTP_LOGIN_STAFF, data),
  loginAdmin: (data) => api.post(API_ENDPOINTS.OTP_LOGIN_ADMIN, data),
  resetRequest: (data) => api.post(API_ENDPOINTS.OTP_RESET_REQUEST, data),
  resetVerify: (data) => api.post(API_ENDPOINTS.OTP_RESET_VERIFY, data),
};

// ─── Workspace Services ──────────────────────────────────────────────────────

export const workspaceService = {
  register: (data) => api.post(API_ENDPOINTS.WORKSPACE_REGISTER, data),
  joinUser: (data) => api.post(API_ENDPOINTS.WORKSPACE_JOIN_USER, data),
  joinStaff: (data) => api.post(API_ENDPOINTS.WORKSPACE_JOIN_STAFF, data),
  getInfo: () => api.get(API_ENDPOINTS.WORKSPACE_INFO),
  updateSettings: (data) => api.put(API_ENDPOINTS.WORKSPACE_SETTINGS, data),
  getMembers: () => api.get(API_ENDPOINTS.WORKSPACE_MEMBERS),
  removeMember: (type, id) => api.delete(`/api/workspace/member/${type}/${id}`),
};

// ─── Complaint Services ──────────────────────────────────────────────────────

export const complaintService = {
  getAll: (params) => api.get(API_ENDPOINTS.COMPLAINTS, { params }),
  getById: (id) => api.get(`${API_ENDPOINTS.COMPLAINTS}/${id}`),
  getMyComplaints: (params) => api.get(API_ENDPOINTS.MY_COMPLAINTS, { params }),
  getLocations: (params) => api.get(API_ENDPOINTS.COMPLAINT_LOCATIONS, { params }),
  create: (data) => api.post(API_ENDPOINTS.COMPLAINTS, data),
  vote: (id) => api.put(`${API_ENDPOINTS.COMPLAINTS}/${id}/vote`),
  rate: (id, data) => api.post(`/api/ratings/${id}/rate`, data),
  getRating: (id) => api.get(`/api/ratings/${id}/rating`),
};

// ─── Admin Services ──────────────────────────────────────────────────────────

export const adminService = {
  // Issues
  getIssues: (params) => api.get(API_ENDPOINTS.ADMIN_ISSUES, { params }),
  getIssueById: (id) => api.get(`${API_ENDPOINTS.ADMIN_ISSUES}/${id}`),
  updateIssue: (id, data) => api.put(`${API_ENDPOINTS.ADMIN_ISSUES}/${id}`, data),
  getStaffList: () => api.get(API_ENDPOINTS.ADMIN_STAFF_LIST),
  bulkAssign: (data) => api.post(API_ENDPOINTS.ADMIN_BULK_ASSIGN, data),
  // Chat on complaints
  getComplaintChat: (id) => api.get(`${API_ENDPOINTS.ADMIN_ISSUES}/${id}/chat`),
  sendComplaintChat: (id, data) => api.post(`${API_ENDPOINTS.ADMIN_ISSUES}/${id}/chat`, data),
  // Analytics
  getAnalytics: (params) => api.get(API_ENDPOINTS.ADMIN_ANALYTICS, { params }),
  getHeatmap: (params) => api.get(API_ENDPOINTS.ADMIN_ANALYTICS_HEATMAP, { params }),
  exportAnalytics: (params) => api.get(API_ENDPOINTS.ADMIN_ANALYTICS_EXPORT, { params, responseType: 'blob' }),
  getStaffPerformance: () => api.get(API_ENDPOINTS.ADMIN_ANALYTICS_STAFF),
  // Workspace
  getWorkspaceInfo: () => api.get(API_ENDPOINTS.WORKSPACE_INFO),
  updateWorkspaceSettings: (data) => api.put(API_ENDPOINTS.WORKSPACE_SETTINGS, data),
  getWorkspaceMembers: () => api.get(API_ENDPOINTS.WORKSPACE_MEMBERS),
  removeMember: (type, id) => api.delete(`/api/workspace/member/${type}/${id}`),
};

// ─── Staff Services ──────────────────────────────────────────────────────────

export const staffService = {
  getComplaints: (params) => api.get(API_ENDPOINTS.STAFF_ISSUES, { params }),
  updateComplaint: (id, data) => api.put(`${API_ENDPOINTS.STAFF_ISSUES}/${id}`, data),
  getStats: () => api.get(API_ENDPOINTS.STAFF_STATS),
  getComplaintChat: (id) => api.get(`${API_ENDPOINTS.STAFF_ISSUES}/${id}/chat`),
  sendComplaintChat: (id, data) => api.post(`${API_ENDPOINTS.STAFF_ISSUES}/${id}/chat`, data),
  getAdmins: () => api.get('/api/staff/issues/admins/list'),
};

// ─── Notification Services ───────────────────────────────────────────────────

export const notificationService = {
  getAll: (userId) => api.get(`${API_ENDPOINTS.NOTIFICATIONS}/${userId}`),
  getStats: (userId) => api.get(`${API_ENDPOINTS.NOTIFICATIONS}/${userId}/stats`),
  markRead: (id) => api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`),
  markAllRead: (userId) => api.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${userId}/read-all`),
  delete: (id) => api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`),
  clearAll: (userId) => api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/user/${userId}`),
};

// ─── Chat Services ────────────────────────────────────────────────────────────

export const chatService = {
  send: (data) => api.post(API_ENDPOINTS.CHAT_SEND, data),
  getConversations: () => api.get(API_ENDPOINTS.CHAT_CONVERSATIONS),
  getConversation: (otherUserId) => api.get(`/api/chat/conversation/${otherUserId}`),
  markRead: (conversationId) => api.patch(`/api/chat/conversation/${conversationId}/read`),
  editMessage: (msgId, data) => api.patch(`/api/chat/message/${msgId}/edit`, data),
  deleteMessage: (msgId) => api.delete(`/api/chat/message/${msgId}/delete`),
  search: (params) => api.get('/api/chat/search', { params }),
  getUnreadCount: () => api.get(API_ENDPOINTS.CHAT_UNREAD),
};

// ─── Leaderboard Services ────────────────────────────────────────────────────

export const leaderboardService = {
  getLeaderboard: (params) => api.get(API_ENDPOINTS.LEADERBOARD, { params }),
  getMyStats: () => api.get(API_ENDPOINTS.LEADERBOARD_ME),
  getStaffRatings: (staffId) => api.get(`${API_ENDPOINTS.RATINGS}/staff/${staffId}`),
};

// ─── Audit Services ───────────────────────────────────────────────────────────

export const auditService = {
  getLogs: (params) => api.get(API_ENDPOINTS.AUDIT, { params }),
  getEntityLogs: (entityId) => api.get(`${API_ENDPOINTS.AUDIT}/${entityId}`),
};

// ─── Upload Services ──────────────────────────────────────────────────────────

export const uploadService = {
  upload: (formData) =>
    api.post(API_ENDPOINTS.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
