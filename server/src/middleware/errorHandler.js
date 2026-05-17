const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
            ...(err.errors && { details: err.errors }) // For validation errors (e.g. Zod)
        }
    });
};

module.exports = errorHandler;
