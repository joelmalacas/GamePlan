const config = require('../config');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(message, statusCode, code = null, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handler middleware
 */
const errorHandler = (error, req, res, next) => {
    let err = { ...error };
    err.message = error.message;

    // Log error
    console.error('💥 Error:', {
        message: err.message,
        stack: config.app.debug ? error.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Default error
    let message = 'Internal Server Error';
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let details = null;

    // Handle specific error types
    if (err.isOperational) {
        // Operational error - safe to send to client
        message = err.message;
        statusCode = err.statusCode;
        code = err.code || 'OPERATIONAL_ERROR';
        details = err.details;
    } else if (err.name === 'ValidationError') {
        // Mongoose/Joi validation error
        message = 'Validation Error';
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        details = Object.values(err.errors || {}).map(val => ({
            field: val.path || val.context?.key,
            message: val.message
        }));
    } else if (err.code === '23505') {
        // PostgreSQL unique constraint violation
        message = 'Duplicate field value';
        statusCode = 400;
        code = 'DUPLICATE_FIELD';
        const field = extractFieldFromPgError(err.detail);
        details = field ? { field, message: `${field} already exists` } : null;
    } else if (err.code === '23503') {
        // PostgreSQL foreign key constraint violation
        message = 'Referenced resource not found';
        statusCode = 400;
        code = 'FOREIGN_KEY_VIOLATION';
    } else if (err.code === '23502') {
        // PostgreSQL not null constraint violation
        message = 'Required field missing';
        statusCode = 400;
        code = 'REQUIRED_FIELD_MISSING';
        const field = extractFieldFromPgError(err.column);
        details = field ? { field, message: `${field} is required` } : null;
    } else if (err.code === '22P02') {
        // PostgreSQL invalid input syntax
        message = 'Invalid data format';
        statusCode = 400;
        code = 'INVALID_DATA_FORMAT';
    } else if (err.name === 'JsonWebTokenError') {
        // JWT error
        message = 'Invalid token';
        statusCode = 401;
        code = 'INVALID_TOKEN';
    } else if (err.name === 'TokenExpiredError') {
        // JWT expired
        message = 'Token expired';
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
    } else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
        // JSON parsing error
        message = 'Invalid JSON payload';
        statusCode = 400;
        code = 'INVALID_JSON';
    } else if (err.type === 'entity.too.large') {
        // Request too large
        message = 'Request entity too large';
        statusCode = 413;
        code = 'REQUEST_TOO_LARGE';
    } else if (err.code === 'ENOENT') {
        // File not found
        message = 'File not found';
        statusCode = 404;
        code = 'FILE_NOT_FOUND';
    } else if (err.code === 'EACCES') {
        // Permission denied
        message = 'Permission denied';
        statusCode = 403;
        code = 'PERMISSION_DENIED';
    } else if (err.code === 'ECONNREFUSED') {
        // Database connection refused
        message = 'Database connection failed';
        statusCode = 503;
        code = 'DATABASE_CONNECTION_FAILED';
    }

    // Prepare error response
    const errorResponse = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
            ...(config.app.debug && {
                stack: error.stack,
                originalError: err
            })
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Extract field name from PostgreSQL error
 */
const extractFieldFromPgError = (errorDetail) => {
    if (!errorDetail) return null;

    // Try to extract field name from error detail
    const match = errorDetail.match(/Key \((.+?)\)=/) ||
                  errorDetail.match(/column "(.+?)"/) ||
                  errorDetail.match(/\((.+?)\)/);

    return match ? match[1] : null;
};

/**
 * Create standardized error responses
 */
const createError = {
    badRequest: (message = 'Bad Request', code = 'BAD_REQUEST', details = null) => {
        return new AppError(message, 400, code, details);
    },

    unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED', details = null) => {
        return new AppError(message, 401, code, details);
    },

    forbidden: (message = 'Forbidden', code = 'FORBIDDEN', details = null) => {
        return new AppError(message, 403, code, details);
    },

    notFound: (message = 'Not Found', code = 'NOT_FOUND', details = null) => {
        return new AppError(message, 404, code, details);
    },

    conflict: (message = 'Conflict', code = 'CONFLICT', details = null) => {
        return new AppError(message, 409, code, details);
    },

    unprocessableEntity: (message = 'Unprocessable Entity', code = 'UNPROCESSABLE_ENTITY', details = null) => {
        return new AppError(message, 422, code, details);
    },

    tooManyRequests: (message = 'Too Many Requests', code = 'TOO_MANY_REQUESTS', details = null) => {
        return new AppError(message, 429, code, details);
    },

    internalServerError: (message = 'Internal Server Error', code = 'INTERNAL_SERVER_ERROR', details = null) => {
        return new AppError(message, 500, code, details);
    },

    serviceUnavailable: (message = 'Service Unavailable', code = 'SERVICE_UNAVAILABLE', details = null) => {
        return new AppError(message, 503, code, details);
    }
};

module.exports = {
    errorHandler,
    asyncHandler,
    AppError,
    createError
};
