const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Import configurations
const config = require("./config");
const { testConnection, closePool } = require("./config/database");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const requestLogger = require("./middleware/requestLogger");
const { validateRequest } = require("./middleware/validateRequest");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const clubRoutes = require("./routes/clubs");
const memberRoutes = require("./routes/members");
const trainingRoutes = require("./routes/training");
const matchRoutes = require("./routes/matches");
const financialRoutes = require("./routes/financial");
const statsRoutes = require("./routes/statistics");
const notificationRoutes = require("./routes/notifications");

// Create Express application
const app = express();

// Trust proxy if configured
if (config.server.trustProxy) {
  app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet(config.security.helmet));

// CORS configuration
app.use(
  cors({
    origin: config.security.cors.origin,
    credentials: config.security.cors.credentials,
    optionsSuccessStatus: config.security.cors.optionsSuccessStatus,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  message: {
    error: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (config.server.env !== "test") {
  app.use(morgan(config.logging.format));
}

// Custom request logging
app.use(requestLogger);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await require("./config/database").healthCheck();
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: require("../package.json").version,
      environment: config.server.env,
      database: dbHealth,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      uptime: `${Math.round(process.uptime())}s`,
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API documentation endpoint
app.get("/api-docs", (req, res) => {
  res.json({
    title: config.api.documentation.title,
    description: config.api.documentation.description,
    version: config.api.documentation.version,
    endpoints: {
      auth: `${config.api.prefix}/${config.api.version}/auth`,
      users: `${config.api.prefix}/${config.api.version}/users`,
      clubs: `${config.api.prefix}/${config.api.version}/clubs`,
      members: `${config.api.prefix}/${config.api.version}/members`,
      training: `${config.api.prefix}/${config.api.version}/training`,
      matches: `${config.api.prefix}/${config.api.version}/matches`,
      financial: `${config.api.prefix}/${config.api.version}/financial`,
      statistics: `${config.api.prefix}/${config.api.version}/statistics`,
      notifications: `${config.api.prefix}/${config.api.version}/notifications`,
    },
    contact: config.api.documentation.contact,
  });
});

// API Routes
const apiRouter = express.Router();

// Mount routes with version prefix
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/clubs", clubRoutes);
apiRouter.use("/members", memberRoutes);
apiRouter.use("/training", trainingRoutes);
apiRouter.use("/matches", matchRoutes);
apiRouter.use("/financial", financialRoutes);
apiRouter.use("/statistics", statsRoutes);
apiRouter.use("/notifications", notificationRoutes);

// Mount API router
app.use(`${config.api.prefix}/${config.api.version}`, apiRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to GamePlan API",
    version: require("../package.json").version,
    environment: config.server.env,
    documentation: "/api-docs",
    health: "/health",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new requests
  server.close(async () => {
    console.log("🚪 HTTP server closed");

    try {
      // Close database connections
      await closePool();
      console.log("💾 Database connections closed");

      // Exit process
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⏰ Shutdown timeout, forcing exit");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit in production, just log
  if (config.server.env !== "production") {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    console.log("🔍 Testing database connection...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...");
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log("🚀 GamePlan Server Started Successfully!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🌐 Environment: ${config.server.env}`);
      console.log(
        `📡 Server: http://${config.server.host}:${config.server.port}`,
      );
      console.log(
        `📚 API Docs: http://${config.server.host}:${config.server.port}/api-docs`,
      );
      console.log(
        `💓 Health: http://${config.server.host}:${config.server.port}/health`,
      );
      console.log(
        `🔗 API Base: http://${config.server.host}:${config.server.port}${config.api.prefix}/${config.api.version}`,
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (config.app.debug) {
        console.log("🐛 Debug mode enabled");
        console.log(
          `📊 Database: ${config.database.host}:${config.database.port}/${config.database.name}`,
        );
        console.log(`🔐 JWT Expires: ${config.jwt.expiresIn}`);
        console.log(`📧 Email Service: ${config.email.smtp.host}`);
      }
    });

    // Store server reference for graceful shutdown
    global.server = server;

    return server;
  } catch (error) {
    console.error("💥 Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
