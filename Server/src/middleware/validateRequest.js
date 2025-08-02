const { validationResult } = require('express-validator');
const { createError } = require('./errorHandler');

/**
 * Validation middleware to handle express-validator errors
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value,
            location: error.location
        }));

        throw createError.badRequest('Validation failed', 'VALIDATION_ERROR', {
            errors: formattedErrors
        });
    }

    next();
};

/**
 * Custom validation helpers
 */
const customValidators = {
    // Check if UUID is valid
    isUUID: (value) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    },

    // Check if date is not in the future
    isNotFutureDate: (value) => {
        return new Date(value) <= new Date();
    },

    // Check if date is not in the past
    isNotPastDate: (value) => {
        return new Date(value) >= new Date();
    },

    // Check if age is within range
    isValidAge: (birthDate, minAge = 0, maxAge = 120) => {
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age >= minAge && age <= maxAge;
    },

    // Check if password meets complexity requirements
    isStrongPassword: (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return regex.test(password) && password.length >= 8;
    }
};

module.exports = {
    validateRequest,
    customValidators
};
