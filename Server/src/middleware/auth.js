const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../config/database');
const { createError } = require('./errorHandler');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw createError.unauthorized('Access token is required', 'TOKEN_REQUIRED');
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret, {
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        });

        // Check if user exists and is active
        const result = await query(
            'SELECT id, email, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            throw createError.unauthorized('User not found', 'USER_NOT_FOUND');
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw createError.forbidden('Account is deactivated', 'ACCOUNT_DEACTIVATED');
        }

        // Check if session exists (optional, for enhanced security)
        const sessionId = req.headers['x-session-id'];
        if (sessionId) {
            const sessionResult = await query(`
                SELECT id, expires_at FROM user_sessions
                WHERE id = $1 AND user_id = $2 AND expires_at > NOW()
            `, [sessionId, user.id]);

            if (sessionResult.rows.length === 0) {
                throw createError.unauthorized('Session expired or invalid', 'SESSION_INVALID');
            }
        }

        // Attach user info to request
        req.user = {
            userId: user.id,
            email: user.email,
            isActive: user.is_active
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(createError.unauthorized('Invalid token', 'INVALID_TOKEN'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(createError.unauthorized('Token expired', 'TOKEN_EXPIRED'));
        }
        next(error);
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, config.jwt.secret, {
            issuer: config.jwt.issuer,
            audience: config.jwt.audience
        });

        const result = await query(
            'SELECT id, email, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
            req.user = {
                userId: result.rows[0].id,
                email: result.rows[0].email,
                isActive: result.rows[0].is_active
            };
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        next();
    }
};

/**
 * Role-based authorization middleware
 * Requires user to have specific role in a club
 */
const requireRole = (roles, requireActive = true) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw createError.unauthorized('Authentication required', 'AUTH_REQUIRED');
            }

            const clubId = req.params.clubId || req.body.clubId || req.query.clubId;

            if (!clubId) {
                throw createError.badRequest('Club ID is required', 'CLUB_ID_REQUIRED');
            }

            // Check user's role in the club
            const result = await query(`
                SELECT cm.id, cr.name as role_name, cr.category, cr.permissions, cm.is_active
                FROM club_members cm
                JOIN club_roles cr ON cm.role_id = cr.id
                WHERE cm.user_id = $1 AND cm.club_id = $2
            `, [req.user.userId, clubId]);

            if (result.rows.length === 0) {
                throw createError.forbidden('Not a member of this club', 'NOT_CLUB_MEMBER');
            }

            const membership = result.rows[0];

            if (requireActive && !membership.is_active) {
                throw createError.forbidden('Club membership is inactive', 'MEMBERSHIP_INACTIVE');
            }

            // Check if user has required role
            const userRoles = Array.isArray(roles) ? roles : [roles];
            const hasRequiredRole = userRoles.includes(membership.role_name) ||
                                  userRoles.includes(membership.category);

            if (!hasRequiredRole) {
                throw createError.forbidden('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS', {
                    required: userRoles,
                    current: membership.role_name
                });
            }

            // Attach club membership info to request
            req.clubMembership = {
                id: membership.id,
                role: membership.role_name,
                category: membership.category,
                permissions: membership.permissions,
                isActive: membership.is_active,
                clubId
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Permission-based authorization middleware
 * Requires user to have specific permission in a club
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw createError.unauthorized('Authentication required', 'AUTH_REQUIRED');
            }

            const clubId = req.params.clubId || req.body.clubId || req.query.clubId;

            if (!clubId) {
                throw createError.badRequest('Club ID is required', 'CLUB_ID_REQUIRED');
            }

            // Get user's permissions in the club
            const result = await query(`
                SELECT cm.id, cr.permissions, cm.is_active
                FROM club_members cm
                JOIN club_roles cr ON cm.role_id = cr.id
                WHERE cm.user_id = $1 AND cm.club_id = $2 AND cm.is_active = true
            `, [req.user.userId, clubId]);

            if (result.rows.length === 0) {
                throw createError.forbidden('Not an active member of this club', 'NOT_ACTIVE_MEMBER');
            }

            const membership = result.rows[0];
            const permissions = membership.permissions || {};

            if (!permissions[permission]) {
                throw createError.forbidden('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS', {
                    required: permission,
                    available: Object.keys(permissions).filter(p => permissions[p])
                });
            }

            req.clubMembership = {
                id: membership.id,
                permissions,
                isActive: membership.is_active,
                clubId
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Club ownership middleware
 * Requires user to be the owner/creator of the club
 */
const requireClubOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            throw createError.unauthorized('Authentication required', 'AUTH_REQUIRED');
        }

        const clubId = req.params.clubId || req.body.clubId || req.query.clubId;

        if (!clubId) {
            throw createError.badRequest('Club ID is required', 'CLUB_ID_REQUIRED');
        }

        // Check if user is club owner
        const result = await query(`
            SELECT c.id, cm.id as membership_id
            FROM clubs c
            JOIN club_members cm ON c.id = cm.club_id
            JOIN club_roles cr ON cm.role_id = cr.id
            WHERE c.id = $1 AND cm.user_id = $2 AND cr.name = 'President' AND cm.is_active = true
        `, [clubId, req.user.userId]);

        if (result.rows.length === 0) {
            throw createError.forbidden('Club ownership required', 'CLUB_OWNERSHIP_REQUIRED');
        }

        req.clubMembership = {
            id: result.rows[0].membership_id,
            role: 'President',
            isOwner: true,
            clubId
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Rate limiting per user
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userId = req.user.userId;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old requests
        if (userRequests.has(userId)) {
            const requests = userRequests.get(userId).filter(time => time > windowStart);
            userRequests.set(userId, requests);
        } else {
            userRequests.set(userId, []);
        }

        const requests = userRequests.get(userId);

        if (requests.length >= maxRequests) {
            throw createError.tooManyRequests(
                'Too many requests from this user',
                'USER_RATE_LIMIT_EXCEEDED'
            );
        }

        requests.push(now);
        userRequests.set(userId, requests);

        next();
    };
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole,
    requirePermission,
    requireClubOwnership,
    userRateLimit
};
