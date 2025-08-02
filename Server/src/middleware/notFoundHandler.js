/**
 * 404 Not Found Handler Middleware
 * Handles requests to non-existent endpoints
 */

const notFoundHandler = (req, res, next) => {
    const error = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            details: {
                method: req.method,
                path: req.originalUrl,
                suggestion: 'Check the URL and HTTP method'
            }
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };

    // Log the 404 for monitoring
    console.log('🔍 404 Not Found:', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        timestamp: new Date().toISOString()
    });

    res.status(404).json(error);
};

module.exports = notFoundHandler;
