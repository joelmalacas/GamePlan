const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");

const { query, transaction } = require("../config/database");
const config = require("../config");
const { asyncHandler, createError } = require("../middleware/errorHandler");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("First name must be between 2 and 100 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Last name must be between 2 and 100 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    body("birthDate")
      .isISO8601()
      .withMessage("Please provide a valid birth date"),
    body("country")
      .isLength({ min: 2, max: 3 })
      .withMessage("Please provide a valid country code"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError.badRequest("Validation failed", "VALIDATION_ERROR", {
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, birthDate, country, phone } =
      req.body;

    await transaction(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
        throw createError.conflict(
          "User already exists with this email",
          "USER_EXISTS",
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

      // Create user
      const userId = uuidv4();
      const result = await client.query(
        `
            INSERT INTO users (
                id, first_name, last_name, email, password_hash,
                birth_date, country, phone, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id, first_name, last_name, email, birth_date, country, phone, created_at
        `,
        [
          userId,
          firstName,
          lastName,
          email,
          passwordHash,
          birthDate,
          country,
          phone,
        ],
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        config.jwt.secret,
        {
          expiresIn: config.jwt.expiresIn,
          issuer: config.jwt.issuer,
          audience: config.jwt.audience,
        },
      );

      // Create session
      const sessionId = uuidv4();
      await client.query(
        `
            INSERT INTO user_sessions (id, user_id, expires_at, created_at, ip_address, user_agent)
            VALUES ($1, $2, NOW() + INTERVAL '${config.jwt.expiresIn}', NOW(), $3, $4)
        `,
        [sessionId, user.id, req.ip, req.get("User-Agent")],
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            birthDate: user.birth_date,
            country: user.country,
            phone: user.phone,
            createdAt: user.created_at,
          },
          token,
          sessionId,
        },
      });
    });
  }),
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError.badRequest("Validation failed", "VALIDATION_ERROR", {
        errors: errors.array(),
      });
    }

    const { email, password, rememberMe } = req.body;

    await transaction(async (client) => {
      // Find user
      const result = await client.query(
        `
            SELECT id, first_name, last_name, email, password_hash,
                   birth_date, country, phone, is_active, last_login
            FROM users
            WHERE email = $1
        `,
        [email],
      );

      if (result.rows.length === 0) {
        throw createError.unauthorized(
          "Invalid credentials",
          "INVALID_CREDENTIALS",
        );
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw createError.forbidden(
          "Account is deactivated",
          "ACCOUNT_DEACTIVATED",
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        throw createError.unauthorized(
          "Invalid credentials",
          "INVALID_CREDENTIALS",
        );
      }

      // Generate JWT token
      const tokenExpiry = rememberMe
        ? config.jwt.refreshExpiresIn
        : config.jwt.expiresIn;
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        config.jwt.secret,
        {
          expiresIn: tokenExpiry,
          issuer: config.jwt.issuer,
          audience: config.jwt.audience,
        },
      );

      // Create session
      const sessionId = uuidv4();
      await client.query(
        `
            INSERT INTO user_sessions (id, user_id, expires_at, created_at, ip_address, user_agent)
            VALUES ($1, $2, NOW() + INTERVAL '$3', NOW(), $4, $5)
        `,
        [sessionId, user.id, tokenExpiry, req.ip, req.get("User-Agent")],
      );

      // Update last login
      await client.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
        user.id,
      ]);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            birthDate: user.birth_date,
            country: user.country,
            phone: user.phone,
            lastLogin: user.last_login,
          },
          token,
          sessionId,
        },
      });
    });
  }),
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate session)
 * @access  Private
 */
router.post(
  "/logout",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const sessionId = req.headers["x-session-id"];

    if (sessionId) {
      await query("DELETE FROM user_sessions WHERE id = $1 AND user_id = $2", [
        sessionId,
        req.user.userId,
      ]);
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }),
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post(
  "/refresh",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { userId, email } = req.user;

    // Generate new token
    const newToken = jwt.sign({ userId, email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
      },
    });
  }),
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const result = await query(
      `
        SELECT u.id, u.first_name, u.last_name, u.email, u.birth_date,
               u.country, u.phone, u.profile_picture_url, u.is_email_verified,
               u.last_login, u.created_at,
               COUNT(cm.id) as club_memberships
        FROM users u
        LEFT JOIN club_members cm ON u.id = cm.user_id AND cm.is_active = true
        WHERE u.id = $1
        GROUP BY u.id
    `,
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      throw createError.notFound("User not found", "USER_NOT_FOUND");
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          birthDate: user.birth_date,
          country: user.country,
          phone: user.phone,
          profilePictureUrl: user.profile_picture_url,
          isEmailVerified: user.is_email_verified,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          clubMemberships: parseInt(user.club_memberships),
        },
      },
    });
  }),
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("First name must be between 2 and 100 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Last name must be between 2 and 100 characters"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),
    body("birthDate")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid birth date"),
    body("country")
      .optional()
      .isLength({ min: 2, max: 3 })
      .withMessage("Please provide a valid country code"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError.badRequest("Validation failed", "VALIDATION_ERROR", {
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, birthDate, country } = req.body;
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      updateValues.push(lastName);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }
    if (birthDate !== undefined) {
      updateFields.push(`birth_date = $${paramIndex++}`);
      updateValues.push(birthDate);
    }
    if (country !== undefined) {
      updateFields.push(`country = $${paramIndex++}`);
      updateValues.push(country);
    }

    if (updateFields.length === 0) {
      throw createError.badRequest("No fields to update", "NO_UPDATE_FIELDS");
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(req.user.userId);

    const result = await query(
      `
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING id, first_name, last_name, email, birth_date, country, phone, updated_at
    `,
      updateValues,
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          birthDate: user.birth_date,
          country: user.country,
          phone: user.phone,
          updatedAt: user.updated_at,
        },
      },
    });
  }),
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      )
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError.badRequest("Validation failed", "VALIDATION_ERROR", {
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    await transaction(async (client) => {
      // Get current password hash
      const result = await client.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [req.user.userId],
      );

      if (result.rows.length === 0) {
        throw createError.notFound("User not found", "USER_NOT_FOUND");
      }

      const { password_hash } = result.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        password_hash,
      );
      if (!isValidPassword) {
        throw createError.unauthorized(
          "Current password is incorrect",
          "INVALID_CURRENT_PASSWORD",
        );
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(
        newPassword,
        config.bcrypt.rounds,
      );

      // Update password
      await client.query(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
        [newPasswordHash, req.user.userId],
      );

      // Invalidate all existing sessions except current one
      const sessionId = req.headers["x-session-id"];
      if (sessionId) {
        await client.query(
          "DELETE FROM user_sessions WHERE user_id = $1 AND id != $2",
          [req.user.userId, sessionId],
        );
      } else {
        await client.query("DELETE FROM user_sessions WHERE user_id = $1", [
          req.user.userId,
        ]);
      }
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }),
);

module.exports = router;
