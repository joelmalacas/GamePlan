/**
 * GamePlan API Configuration
 * Frontend configuration for API endpoints and settings
 */

// API Configuration
const API_CONFIG = {
  // Base URL for the API
  BASE_URL: "http://localhost:3000",

  // API version and prefix
  API_PREFIX: "/api",
  API_VERSION: "v1",

  // Full API base URL
  get API_BASE() {
    return `${this.BASE_URL}${this.API_PREFIX}/${this.API_VERSION}`;
  },

  // Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      ME: "/auth/me",
      PROFILE: "/auth/profile",
      CHANGE_PASSWORD: "/auth/change-password",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
      VERIFY_EMAIL: "/auth/verify-email",
    },

    // User endpoints
    USERS: {
      LIST: "/users",
      PROFILE: "/users/profile",
      UPDATE_PROFILE: "/users/profile",
      UPLOAD_AVATAR: "/users/avatar",
    },

    // Club endpoints
    CLUBS: {
      LIST: "/clubs",
      CREATE: "/clubs",
      DETAIL: "/clubs/:id",
      UPDATE: "/clubs/:id",
      DELETE: "/clubs/:id",
      MEMBERS: "/clubs/:id/members",
      INVITE_MEMBER: "/clubs/:id/invite",
      REMOVE_MEMBER: "/clubs/:id/members/:memberId",
      STATISTICS: "/clubs/:id/statistics",
      LOGO: "/clubs/:id/logo",
    },

    // Member endpoints
    MEMBERS: {
      LIST: "/members",
      CREATE: "/members",
      DETAIL: "/members/:id",
      UPDATE: "/members/:id",
      DELETE: "/members/:id",
      MEDICAL_INFO: "/members/:id/medical",
      PERFORMANCE: "/members/:id/performance",
      CONTRACTS: "/members/:id/contracts",
    },

    // Training endpoints
    TRAINING: {
      LIST: "/training",
      CREATE: "/training",
      DETAIL: "/training/:id",
      UPDATE: "/training/:id",
      DELETE: "/training/:id",
      ATTENDANCE: "/training/:id/attendance",
      MARK_ATTENDANCE: "/training/:id/attendance/:memberId",
    },

    // Match endpoints
    MATCHES: {
      LIST: "/matches",
      CREATE: "/matches",
      DETAIL: "/matches/:id",
      UPDATE: "/matches/:id",
      DELETE: "/matches/:id",
      LINEUP: "/matches/:id/lineup",
      STATS: "/matches/:id/stats",
      EVENTS: "/matches/:id/events",
    },

    // Financial endpoints
    FINANCIAL: {
      TRANSACTIONS: "/financial/transactions",
      CATEGORIES: "/financial/categories",
      INVOICES: "/financial/invoices",
      PAYMENTS: "/financial/payments",
      REPORTS: "/financial/reports",
      MEMBER_FEES: "/financial/member-fees",
    },

    // Statistics endpoints
    STATISTICS: {
      PLAYER: "/statistics/player/:id",
      CLUB: "/statistics/club/:id",
      TEAM: "/statistics/team/:id",
      SEASON: "/statistics/season/:id",
      DASHBOARD: "/statistics/dashboard",
    },

    // Notification endpoints
    NOTIFICATIONS: {
      LIST: "/notifications",
      MARK_READ: "/notifications/:id/read",
      MARK_ALL_READ: "/notifications/read-all",
      DELETE: "/notifications/:id",
      SETTINGS: "/notifications/settings",
    },

    // File upload endpoints
    UPLOADS: {
      SINGLE: "/uploads/single",
      MULTIPLE: "/uploads/multiple",
      AVATAR: "/uploads/avatar",
      CLUB_LOGO: "/uploads/club-logo",
      DOCUMENTS: "/uploads/documents",
    },

    // Settings endpoints
    SETTINGS: {
      CLUB: "/settings/club",
      USER: "/settings/user",
      NOTIFICATIONS: "/settings/notifications",
      PRIVACY: "/settings/privacy",
    },
  },
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Storage keys for localStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: "gameplan_access_token",
  SESSION_ID: "gameplan_session_id",
  USER_DATA: "gameplan_user_data",
  REFRESH_TOKEN: "gameplan_refresh_token",
  REMEMBER_ME: "gameplan_remember_me",
  THEME: "gameplan_theme",
  LANGUAGE: "gameplan_language",
  CLUB_SETTINGS: "gameplan_club_settings",
};

// Application settings
const APP_SETTINGS = {
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 30000,

  // Token refresh threshold (refresh when token expires in less than this time)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes

  // Maximum retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,

  // Retry delay in milliseconds
  RETRY_DELAY: 1000,

  // Default pagination limit
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Supported file types for uploads
  SUPPORTED_FILE_TYPES: {
    IMAGES: ["jpg", "jpeg", "png", "gif", "webp"],
    DOCUMENTS: ["pdf", "doc", "docx", "txt", "xlsx", "xls"],
    ALL: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "pdf",
      "doc",
      "docx",
      "txt",
      "xlsx",
      "xls",
    ],
  },

  // Maximum file size in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Date formats
  DATE_FORMAT: "YYYY-MM-DD",
  DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
  TIME_FORMAT: "HH:mm",
  DISPLAY_DATE_FORMAT: "DD/MM/YYYY",
  DISPLAY_DATETIME_FORMAT: "DD/MM/YYYY HH:mm",

  // Validation patterns
  VALIDATION: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    NAME: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    POSTAL_CODE_PT: /^\d{4}-\d{3}$/,
    NIF_PT: /^\d{9}$/,
    IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/,
  },

  // Themes
  THEMES: {
    LIGHT: "light",
    DARK: "dark",
    AUTO: "auto",
  },

  // Languages
  LANGUAGES: {
    PT: "pt",
    EN: "en",
    ES: "es",
    FR: "fr",
  },

  // Debug mode
  DEBUG: true, // Set to false for production

  // Auto-save interval (in milliseconds)
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  // Session timeout (in milliseconds)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours

  // Notification settings
  NOTIFICATION_DURATION: 5000, // 5 seconds
  MAX_NOTIFICATIONS: 5,
};

// User roles and permissions
const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  CLUB_ADMIN: "club_admin",
  COACH: "coach",
  ASSISTANT_COACH: "assistant_coach",
  PLAYER: "player",
  PARENT: "parent",
  STAFF: "staff",
  VIEWER: "viewer",
};

// Permission levels
const PERMISSIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  VIEW_ALL: "view_all",
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: [
    PERMISSIONS.CREATE,
    PERMISSIONS.READ,
    PERMISSIONS.UPDATE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE,
    PERMISSIONS.VIEW_ALL,
  ],
  [USER_ROLES.CLUB_ADMIN]: [
    PERMISSIONS.CREATE,
    PERMISSIONS.READ,
    PERMISSIONS.UPDATE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE,
  ],
  [USER_ROLES.COACH]: [
    PERMISSIONS.CREATE,
    PERMISSIONS.READ,
    PERMISSIONS.UPDATE,
  ],
  [USER_ROLES.ASSISTANT_COACH]: [PERMISSIONS.READ, PERMISSIONS.UPDATE],
  [USER_ROLES.PLAYER]: [PERMISSIONS.READ],
  [USER_ROLES.PARENT]: [PERMISSIONS.READ],
  [USER_ROLES.STAFF]: [PERMISSIONS.READ, PERMISSIONS.UPDATE],
  [USER_ROLES.VIEWER]: [PERMISSIONS.READ],
};

// Error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "There was a conflict with your request.",
  TOO_MANY_REQUESTS: "Too many requests. Please wait a moment and try again.",
  INTERNAL_ERROR: "An internal error occurred. Please try again later.",
  SERVICE_UNAVAILABLE:
    "Service is currently unavailable. Please try again later.",

  // Form validation messages
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PASSWORD:
    "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  INVALID_PHONE: "Please enter a valid phone number.",
  INVALID_NAME: "Name must contain only letters and be 2-50 characters long.",
  INVALID_DATE: "Please enter a valid date.",
  INVALID_NIF: "Please enter a valid NIF (9 digits).",
  INVALID_POSTAL_CODE: "Please enter a valid postal code (####-###).",
  INVALID_IBAN: "Please enter a valid IBAN.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (10MB).",
  INVALID_FILE_TYPE:
    "Invalid file type. Supported formats: JPG, PNG, PDF, DOC, DOCX.",
  UPLOAD_FAILED: "File upload failed. Please try again.",

  // Generic messages
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  ACCESS_DENIED: "You don't have permission to access this resource.",
  CLUB_NOT_FOUND: "Club not found.",
  MEMBER_NOT_FOUND: "Member not found.",
  TRAINING_NOT_FOUND: "Training session not found.",
  MATCH_NOT_FOUND: "Match not found.",
};

// Success messages
const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Account created successfully! Welcome to GamePlan.",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  EMAIL_VERIFIED: "Email verified successfully.",
  CLUB_CREATED: "Club created successfully.",
  CLUB_UPDATED: "Club information updated successfully.",
  MEMBER_ADDED: "Member added successfully.",
  MEMBER_UPDATED: "Member information updated successfully.",
  TRAINING_CREATED: "Training session created successfully.",
  TRAINING_UPDATED: "Training session updated successfully.",
  MATCH_CREATED: "Match created successfully.",
  MATCH_UPDATED: "Match information updated successfully.",
  INVITATION_SENT: "Invitation sent successfully.",
  PAYMENT_PROCESSED: "Payment processed successfully.",
  FILE_UPLOADED: "File uploaded successfully.",

  // Generic messages
  OPERATION_SUCCESS: "Operation completed successfully.",
  DATA_SAVED: "Data saved successfully.",
  DATA_DELETED: "Data deleted successfully.",
  SETTINGS_SAVED: "Settings saved successfully.",
};

// Loading messages
const LOADING_MESSAGES = {
  SIGNING_IN: "Signing you in...",
  CREATING_ACCOUNT: "Creating your account...",
  LOADING_DATA: "Loading data...",
  SAVING_DATA: "Saving data...",
  UPLOADING_FILE: "Uploading file...",
  PROCESSING_PAYMENT: "Processing payment...",
  SENDING_INVITATION: "Sending invitation...",
  GENERATING_REPORT: "Generating report...",
  PROCESSING: "Processing...",
};

// Country codes (ISO 3166-1 alpha-2) - Main countries
const COUNTRIES = {
  PT: "Portugal",
  BR: "Brazil",
  ES: "Spain",
  FR: "France",
  IT: "Italy",
  DE: "Germany",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  AR: "Argentina",
  BE: "Belgium",
  CH: "Switzerland",
  CN: "China",
  JP: "Japan",
  KR: "South Korea",
  MX: "Mexico",
  NL: "Netherlands",
  NO: "Norway",
  PL: "Poland",
  RU: "Russia",
  SE: "Sweden",
  TR: "Turkey",
  ZA: "South Africa",
  IN: "India",
  EG: "Egypt",
  MA: "Morocco",
  NG: "Nigeria",
  KE: "Kenya",
  GH: "Ghana",
  TN: "Tunisia",
  DZ: "Algeria",
  AO: "Angola",
  MZ: "Mozambique",
  CV: "Cape Verde",
  OTHER: "Other",
};

// Phone country codes
const PHONE_CODES = {
  PT: "+351",
  BR: "+55",
  ES: "+34",
  FR: "+33",
  IT: "+39",
  DE: "+49",
  GB: "+44",
  US: "+1",
  CA: "+1",
  AU: "+61",
  AR: "+54",
  BE: "+32",
  CH: "+41",
  CN: "+86",
  JP: "+81",
  KR: "+82",
  MX: "+52",
  NL: "+31",
  NO: "+47",
  PL: "+48",
  RU: "+7",
  SE: "+46",
  TR: "+90",
  ZA: "+27",
  IN: "+91",
  EG: "+20",
  MA: "+212",
  NG: "+234",
  KE: "+254",
  GH: "+233",
  TN: "+216",
  DZ: "+213",
  AO: "+244",
  MZ: "+258",
  CV: "+238",
};

// Sports positions
const POSITIONS = {
  FOOTBALL: {
    // Goalkeepers
    GK: "Goalkeeper",

    // Defenders
    CB: "Centre Back",
    LB: "Left Back",
    RB: "Right Back",
    LWB: "Left Wing Back",
    RWB: "Right Wing Back",
    SW: "Sweeper",

    // Midfielders
    CDM: "Defensive Midfielder",
    CM: "Central Midfielder",
    CAM: "Attacking Midfielder",
    LM: "Left Midfielder",
    RM: "Right Midfielder",
    LW: "Left Winger",
    RW: "Right Winger",

    // Forwards
    CF: "Centre Forward",
    ST: "Striker",
    LF: "Left Forward",
    RF: "Right Forward",
    SS: "Second Striker",
  },
};

// Training types
const TRAINING_TYPES = {
  tactical: "Tactical Training",
  physical: "Physical Training",
  technical: "Technical Training",
  friendly_match: "Friendly Match",
  recovery: "Recovery Session",
  goalkeeper: "Goalkeeper Training",
  set_pieces: "Set Pieces",
  conditioning: "Physical Conditioning",
  team_building: "Team Building",
  video_analysis: "Video Analysis",
};

// Training intensity levels
const TRAINING_INTENSITY = {
  low: "Low",
  medium: "Medium",
  high: "High",
  maximum: "Maximum",
};

// Match types
const MATCH_TYPES = {
  league: "League Match",
  cup: "Cup Match",
  friendly: "Friendly Match",
  tournament: "Tournament",
  playoff: "Playoff",
  final: "Final",
};

// Match statuses
const MATCH_STATUSES = {
  scheduled: "Scheduled",
  warmup: "Warm-up",
  first_half: "First Half",
  halftime: "Half Time",
  second_half: "Second Half",
  extra_time: "Extra Time",
  penalties: "Penalties",
  completed: "Completed",
  postponed: "Postponed",
  cancelled: "Cancelled",
  abandoned: "Abandoned",
};

// Match events
const MATCH_EVENTS = {
  goal: "Goal",
  assist: "Assist",
  yellow_card: "Yellow Card",
  red_card: "Red Card",
  substitution: "Substitution",
  penalty: "Penalty",
  own_goal: "Own Goal",
  offside: "Offside",
  foul: "Foul",
  corner: "Corner",
  free_kick: "Free Kick",
};

// Payment statuses
const PAYMENT_STATUSES = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  waived: "Waived",
  cancelled: "Cancelled",
  refunded: "Refunded",
  partial: "Partial Payment",
};

// Payment methods
const PAYMENT_METHODS = {
  cash: "Cash",
  card: "Credit/Debit Card",
  bank_transfer: "Bank Transfer",
  mbway: "MB WAY",
  multibanco: "Multibanco",
  paypal: "PayPal",
  other: "Other",
};

// Financial categories
const FINANCIAL_CATEGORIES = {
  // Income
  membership_fees: "Membership Fees",
  registration_fees: "Registration Fees",
  equipment_sales: "Equipment Sales",
  sponsorship: "Sponsorship",
  donations: "Donations",
  tournament_prizes: "Tournament Prizes",

  // Expenses
  equipment: "Equipment",
  facility_rental: "Facility Rental",
  transportation: "Transportation",
  referee_fees: "Referee Fees",
  insurance: "Insurance",
  medical: "Medical Expenses",
  administrative: "Administrative",
  marketing: "Marketing",
  utilities: "Utilities",
  other_income: "Other Income",
  other_expense: "Other Expense",
};

// Injury types
const INJURY_TYPES = {
  muscle: "Muscle Injury",
  ligament: "Ligament Injury",
  bone: "Bone Injury",
  concussion: "Concussion",
  cut: "Cut/Laceration",
  bruise: "Bruise",
  sprain: "Sprain",
  strain: "Strain",
  fracture: "Fracture",
  other: "Other",
};

// Injury severity
const INJURY_SEVERITY = {
  minor: "Minor (1-7 days)",
  moderate: "Moderate (1-4 weeks)",
  major: "Major (1-6 months)",
  severe: "Severe (6+ months)",
};

// Notification types
const NOTIFICATION_TYPES = {
  training_reminder: "Training Reminder",
  match_callup: "Match Call-up",
  payment_due: "Payment Due",
  payment_overdue: "Payment Overdue",
  announcement: "Announcement",
  injury_report: "Injury Report",
  club_invitation: "Club Invitation",
  role_change: "Role Change",
  new_member: "New Member",
  match_result: "Match Result",
  birthday: "Birthday Reminder",
  season_start: "Season Start",
  season_end: "Season End",
};

// Priority levels
const PRIORITY_LEVELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// Season statuses
const SEASON_STATUSES = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Competition levels
const COMPETITION_LEVELS = {
  youth: "Youth",
  amateur: "Amateur",
  semi_professional: "Semi-Professional",
  professional: "Professional",
  international: "International",
};

// Age categories
const AGE_CATEGORIES = {
  u6: "Under 6",
  u8: "Under 8",
  u10: "Under 10",
  u12: "Under 12",
  u14: "Under 14",
  u16: "Under 16",
  u18: "Under 18",
  u20: "Under 20",
  u23: "Under 23",
  senior: "Senior",
  veteran: "Veteran (35+)",
};

// Export all constants for use in other files
if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = {
    API_CONFIG,
    HTTP_STATUS,
    STORAGE_KEYS,
    APP_SETTINGS,
    USER_ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    LOADING_MESSAGES,
    COUNTRIES,
    PHONE_CODES,
    POSITIONS,
    TRAINING_TYPES,
    TRAINING_INTENSITY,
    MATCH_TYPES,
    MATCH_STATUSES,
    MATCH_EVENTS,
    PAYMENT_STATUSES,
    PAYMENT_METHODS,
    FINANCIAL_CATEGORIES,
    INJURY_TYPES,
    INJURY_SEVERITY,
    NOTIFICATION_TYPES,
    PRIORITY_LEVELS,
    SEASON_STATUSES,
    COMPETITION_LEVELS,
    AGE_CATEGORIES,
  };
} else if (typeof window !== "undefined") {
  // Browser environment
  window.API_CONFIG = API_CONFIG;
  window.HTTP_STATUS = HTTP_STATUS;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.APP_SETTINGS = APP_SETTINGS;
  window.USER_ROLES = USER_ROLES;
  window.PERMISSIONS = PERMISSIONS;
  window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
  window.ERROR_MESSAGES = ERROR_MESSAGES;
  window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
  window.LOADING_MESSAGES = LOADING_MESSAGES;
  window.COUNTRIES = COUNTRIES;
  window.PHONE_CODES = PHONE_CODES;
  window.POSITIONS = POSITIONS;
  window.TRAINING_TYPES = TRAINING_TYPES;
  window.TRAINING_INTENSITY = TRAINING_INTENSITY;
  window.MATCH_TYPES = MATCH_TYPES;
  window.MATCH_STATUSES = MATCH_STATUSES;
  window.MATCH_EVENTS = MATCH_EVENTS;
  window.PAYMENT_STATUSES = PAYMENT_STATUSES;
  window.PAYMENT_METHODS = PAYMENT_METHODS;
  window.FINANCIAL_CATEGORIES = FINANCIAL_CATEGORIES;
  window.INJURY_TYPES = INJURY_TYPES;
  window.INJURY_SEVERITY = INJURY_SEVERITY;
  window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
  window.PRIORITY_LEVELS = PRIORITY_LEVELS;
  window.SEASON_STATUSES = SEASON_STATUSES;
  window.COMPETITION_LEVELS = COMPETITION_LEVELS;
  window.AGE_CATEGORIES = AGE_CATEGORIES;
}
