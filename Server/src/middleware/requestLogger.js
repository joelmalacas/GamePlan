/**
 * Request Logger Middleware
 * Logs incoming requests with detailed information for debugging and monitoring
 */

const config = require('../config');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Extract request information
    const requestInfo = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        contentType: req.get('Content-Type'),
        contentLength: req.get('Content-Length'),
        timestamp,
        headers: config.app.debug ? req.headers : undefined
    };

    // Log the incoming request
    if (config.app.debug) {
        console.log('📥 Incoming Request:', {
            ...requestInfo,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            body: req.body && Object.keys(req.body).length > 0 ?
                  sanitizeBody(req.body) : undefined
        });
    }

    // Override res.end to capture response information
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log the response
        const responseInfo = {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length'),
            timestamp: new Date().toISOString()
        };

        // Color code based on status
        const statusColor = getStatusColor(res.statusCode);
        const durationColor = getDurationColor(duration);

        console.log(
            `${statusColor}${res.statusCode}${'\x1b[0m'} ` +
            `${req.method} ${req.originalUrl} ` +
            `${durationColor}${duration}ms${'\x1b[0m'} ` +
            `${req.ip}`
        );

        // Detailed logging in debug mode
        if (config.app.debug) {
            console.log('📤 Response:', responseInfo);
        }

        // Log slow requests
        if (duration > 1000) {
            console.warn('🐌 Slow Request:', {
                ...requestInfo,
                ...responseInfo,
                warning: 'Request took longer than 1 second'
            });
        }

        // Log error responses
        if (res.statusCode >= 400) {
            console.error('❌ Error Response:', {
                ...requestInfo,
                ...responseInfo,
                error: res.statusMessage
            });
        }

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Sanitize request body for logging (remove sensitive information)
 */
const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sensitiveFields = [
        'password',
        'confirmPassword',
        'currentPassword',
        'newPassword',
        'token',
        'accessToken',
        'refreshToken',
        'apiKey',
        'secret',
        'creditCard',
        'ssn',
        'socialSecurityNumber'
    ];

    const sanitized = { ...body };

    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const lowerKey = key.toLowerCase();

                if (sensitiveFields.some(field => lowerKey.includes(field))) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                }
            }
        }
    };

    sanitizeObject(sanitized);
    return sanitized;
};

/**
 * Get color code for HTTP status
 */
const getStatusColor = (status) => {
    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[37m'; // White
};

/**
 * Get color code for request duration
 */
const getDurationColor = (duration) => {
    if (duration > 1000) return '\x1b[31m'; // Red (slow)
    if (duration > 500) return '\x1b[33m';  // Yellow (moderate)
    if (duration > 100) return '\x1b[36m';  // Cyan (fast)
    return '\x1b[32m'; // Green (very fast)
};

/**
 * Skip logging for certain paths (health checks, static files, etc.)
 */
const shouldSkipLogging = (req) => {
    const skipPaths = [
        '/health',
        '/favicon.ico',
        '/robots.txt'
    ];

    const skipExtensions = [
        '.css',
        '.js',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.ico',
        '.svg'
    ];

    // Skip certain paths
    if (skipPaths.some(path => req.originalUrl.startsWith(path))) {
        return true;
    }

    // Skip static files
    if (skipExtensions.some(ext => req.originalUrl.toLowerCase().endsWith(ext))) {
        return true;
    }

    return false;
};

/**
 * Enhanced request logger with skip functionality
 */
const enhancedRequestLogger = (req, res, next) => {
    if (shouldSkipLogging(req)) {
        return next();
    }

    return requestLogger(req, res, next);
};

module.exports = enhancedRequestLogger;
