export const COMPLAINT_CATEGORIES = [
  { id: 'road',        label: 'Road & Infrastructure', icon: '🛣️' },
  { id: 'water',       label: 'Water Supply',          icon: '💧' },
  { id: 'electricity', label: 'Electricity',           icon: '⚡' },
  { id: 'sanitation',  label: 'Sanitation & Waste',    icon: '🗑️' },
  { id: 'other',       label: 'Other',                 icon: '📋' },
];

export const COMPLAINT_STATUS = {
  PENDING:     'pending',
  IN_PROGRESS: 'in-progress',
  RESOLVED:    'resolved',
  REJECTED:    'rejected',
};

export const PRIORITY_LEVELS = {
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  CRITICAL: 'critical',
};

export const WORKSPACE_TYPES = [
  { id: 'college',      label: 'College / University' },
  { id: 'municipality', label: 'Municipality' },
  { id: 'society',      label: 'Housing Society' },
  { id: 'rwa',          label: 'RWA' },
  { id: 'other',        label: 'Other' },
];

// ─── All API endpoint paths ───────────────────────────────────────────────────
export const API = {
  // Auth
  USER_SIGNUP:   '/api/users/signup',
  USER_LOGIN:    '/api/users/login',
  USER_LOGOUT:   '/api/users/logout',
  USER_PROFILE:  '/api/users/profile',
  STAFF_REGISTER: '/api/staff/register',
  STAFF_LOGIN:   '/api/staff/login',
  ADMIN_LOGIN:   '/api/admin/login',

  // OTP
  OTP_REQUEST:       '/api/otp/request',
  OTP_VERIFY:        '/api/otp/verify',
  OTP_RESEND:        '/api/otp/resend',
  OTP_SIGNUP_USER:   '/api/otp/signup/user',
  OTP_LOGIN_USER:    '/api/otp/login/user',
  OTP_LOGIN_STAFF:   '/api/otp/login/staff',
  OTP_LOGIN_ADMIN:   '/api/otp/login/admin',
  OTP_RESET_REQUEST: '/api/otp/password-reset/request',
  OTP_RESET_VERIFY:  '/api/otp/password-reset/verify',

  // Workspace
  WORKSPACE_REGISTER:  '/api/workspace/register',
  WORKSPACE_JOIN_USER: '/api/workspace/join/user',
  WORKSPACE_JOIN_STAFF:'/api/workspace/join/staff',
  WORKSPACE_INFO:      '/api/workspace/info',
  WORKSPACE_SETTINGS:  '/api/workspace/settings',
  WORKSPACE_MEMBERS:   '/api/workspace/members',

  // User complaints
  USER_ISSUES:       '/api/user_issues',
  MY_ISSUES:         '/api/user_issues/my-issues',
  ISSUE_LOCATIONS:   '/api/user_issues/locations',

  // Admin complaints
  ADMIN_ISSUES:      '/api/admin/issues',
  ADMIN_STAFF_LIST:  '/api/admin/issues/staff',
  ADMIN_BULK_ASSIGN: '/api/admin/issues/bulk-assign',

  // Staff complaints
  STAFF_ISSUES: '/api/staff/issues',
  STAFF_STATS:  '/api/staff/issues/stats',

  // Analytics
  ANALYTICS:           '/api/admin/analytics',
  ANALYTICS_HEATMAP:   '/api/admin/analytics/heatmap',
  ANALYTICS_EXPORT:    '/api/admin/analytics/export',
  ANALYTICS_STAFF_PERF:'/api/admin/analytics/staff-performance',

  // Notifications
  NOTIFICATIONS: '/api/notifications',

  // Chat
  CHAT_SEND:          '/api/chat/send',
  CHAT_CONVERSATIONS: '/api/chat/conversations',
  CHAT_CONVERSATION:  '/api/chat/conversation',
  CHAT_UNREAD:        '/api/chat/unread-count',

  // Leaderboard
  LEADERBOARD:    '/api/leaderboard',
  LEADERBOARD_ME: '/api/leaderboard/me',

  // Ratings
  RATINGS: '/api/ratings',

  // Audit
  AUDIT: '/api/audit',

  // Upload
  UPLOAD: '/api/upload',
};

// ─── API_ENDPOINTS alias ──────────────────────────────────────────────────────
// services/index.js imports API_ENDPOINTS. This maps every key it needs.
export const API_ENDPOINTS = {
  // Auth
  USER_SIGNUP:    API.USER_SIGNUP,
  USER_LOGIN:     API.USER_LOGIN,
  USER_PROFILE:   API.USER_PROFILE,
  STAFF_REGISTER: API.STAFF_REGISTER,
  STAFF_LOGIN:    API.STAFF_LOGIN,
  ADMIN_LOGIN:    API.ADMIN_LOGIN,

  // OTP
  OTP_REQUEST:       API.OTP_REQUEST,
  OTP_VERIFY:        API.OTP_VERIFY,
  OTP_RESEND:        API.OTP_RESEND,
  OTP_SIGNUP_USER:   API.OTP_SIGNUP_USER,
  OTP_LOGIN_USER:    API.OTP_LOGIN_USER,
  OTP_LOGIN_STAFF:   API.OTP_LOGIN_STAFF,
  OTP_LOGIN_ADMIN:   API.OTP_LOGIN_ADMIN,
  OTP_RESET_REQUEST: API.OTP_RESET_REQUEST,
  OTP_RESET_VERIFY:  API.OTP_RESET_VERIFY,

  // Workspace
  WORKSPACE_REGISTER:  API.WORKSPACE_REGISTER,
  WORKSPACE_JOIN_USER: API.WORKSPACE_JOIN_USER,
  WORKSPACE_JOIN_STAFF:API.WORKSPACE_JOIN_STAFF,
  WORKSPACE_INFO:      API.WORKSPACE_INFO,
  WORKSPACE_SETTINGS:  API.WORKSPACE_SETTINGS,
  WORKSPACE_MEMBERS:   API.WORKSPACE_MEMBERS,

  // Complaints — services/index.js uses COMPLAINTS / MY_COMPLAINTS / COMPLAINT_LOCATIONS
  COMPLAINTS:          API.USER_ISSUES,
  MY_COMPLAINTS:       API.MY_ISSUES,
  COMPLAINT_LOCATIONS: API.ISSUE_LOCATIONS,

  // Admin
  ADMIN_ISSUES:      API.ADMIN_ISSUES,
  ADMIN_STAFF_LIST:  API.ADMIN_STAFF_LIST,
  ADMIN_BULK_ASSIGN: API.ADMIN_BULK_ASSIGN,

  // Staff
  STAFF_ISSUES: API.STAFF_ISSUES,
  STAFF_STATS:  API.STAFF_STATS,

  // Analytics — services uses ADMIN_ANALYTICS* prefix
  ADMIN_ANALYTICS:        API.ANALYTICS,
  ADMIN_ANALYTICS_HEATMAP:API.ANALYTICS_HEATMAP,
  ADMIN_ANALYTICS_EXPORT: API.ANALYTICS_EXPORT,
  ADMIN_ANALYTICS_STAFF:  API.ANALYTICS_STAFF_PERF,

  // Notifications
  NOTIFICATIONS: API.NOTIFICATIONS,

  // Chat
  CHAT_SEND:          API.CHAT_SEND,
  CHAT_CONVERSATIONS: API.CHAT_CONVERSATIONS,
  CHAT_UNREAD:        API.CHAT_UNREAD,

  // Leaderboard
  LEADERBOARD:    API.LEADERBOARD,
  LEADERBOARD_ME: API.LEADERBOARD_ME,

  // Ratings
  RATINGS: API.RATINGS,

  // Audit
  AUDIT: API.AUDIT,

  // Upload
  UPLOAD: API.UPLOAD,
};

export const STORAGE = {
  ACCESS_TOKEN: 'accessToken',
  ADMIN_TOKEN:  'adminToken',
  STAFF_TOKEN:  'staffToken',
  USER_DATA:    'user',
  ADMIN_DATA:   'adminData',
  STAFF_DATA:   'staffData',
  REFRESH_TOKEN:'refreshToken',
};
