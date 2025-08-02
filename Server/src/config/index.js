const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
    env: process.env.NODE_ENV || "development",
    trustProxy: process.env.TRUST_PROXY === "true",
    corsOrigin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:3000"],
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === "true",
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_change_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    issuer: "gameplan-api",
    audience: "gameplan-client",
  },

  // Password Hashing
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: {
      email: process.env.FROM_EMAIL || "noreply@gameplan.com",
      name: process.env.FROM_NAME || "GamePlan Team",
    },
    templates: {
      verification: "email-verification",
      passwordReset: "password-reset",
      welcome: "welcome",
      invitation: "club-invitation",
    },
  },

  // File Upload Configuration
  upload: {
    directory: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(",")
      : ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    destinations: {
      profiles: "profiles",
      logos: "logos",
      documents: "documents",
      receipts: "receipts",
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || "your_session_secret",
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 60 * 60 * 1000, // 1 hour
    name: "gameplan.sid",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },

  // API Configuration
  api: {
    version: process.env.API_VERSION || "v1",
    prefix: process.env.API_PREFIX || "/api",
    documentation: {
      title: "GamePlan API",
      description: "Sports Club Management System API",
      version: "1.0.0",
      contact: {
        name: "GamePlan Team",
        email: "api@gameplan.com",
      },
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
    maxFiles: 5,
    maxSize: "10m",
    format: "combined",
    colorize: process.env.NODE_ENV === "development",
  },

  // Redis Configuration (optional)
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: "gameplan:",
    ttl: 3600, // 1 hour default TTL
  },

  // External Services
  services: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    notifications: {
      pushKey: process.env.PUSH_NOTIFICATION_KEY,
      smsApiKey: process.env.SMS_API_KEY,
    },
  },

  // Application Settings
  app: {
    debug: process.env.DEBUG === "true",
    timezone: "UTC",
    locale: "en",
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
    },
    cache: {
      ttl: 300, // 5 minutes
      checkPeriod: 600, // 10 minutes
    },
  },

  // Security Settings
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    },
    cors: {
      credentials: true,
      optionsSuccessStatus: 200,
    },
  },

  // Business Logic Settings
  business: {
    subscription: {
      plans: ["free", "basic", "premium"],
      limits: {
        free: {
          clubs: 1,
          members: 25,
          matches: 50,
          training_sessions: 100,
        },
        basic: {
          clubs: 3,
          members: 100,
          matches: 200,
          training_sessions: 500,
        },
        premium: {
          clubs: -1, // unlimited
          members: -1,
          matches: -1,
          training_sessions: -1,
        },
      },
    },
    match: {
      maxSquadSize: 23,
      maxSubstitutions: 5,
      defaultMatchDuration: 90, // minutes
    },
    training: {
      maxParticipants: 50,
      defaultDuration: 90, // minutes
    },
  },
};

// Validation
const validateConfig = () => {
  const requiredEnvVars = ["DB_PASSWORD", "JWT_SECRET"];

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", "),
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  if (process.env.NODE_ENV === "production") {
    if (config.jwt.secret === "your_jwt_secret_change_in_production") {
      console.error("❌ JWT_SECRET must be changed in production");
      process.exit(1);
    }

    if (config.session.secret === "your_session_secret") {
      console.error("❌ SESSION_SECRET must be changed in production");
      process.exit(1);
    }
  }
};

// Development vs Production overrides
if (config.server.env === "production") {
  // Production optimizations
  config.logging.level = "warn";
  config.app.debug = false;
  config.security.cors.origin = config.server.corsOrigin;
} else {
  // Development settings
  config.app.debug = true;
  config.security.cors.origin = true; // Allow all origins in development
}

// Validate configuration on load
validateConfig();

module.exports = config;
