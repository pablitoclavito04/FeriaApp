const { body, validationResult } = require('express-validator');

// Helper to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const loginValidator = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// Register validator (public sign-up)
const registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// Role update validator (admin changing another user's role)
const roleUpdateValidator = [
  body('role')
    .isIn(['admin', 'editor', 'viewer']).withMessage('Role must be admin, editor or viewer'),
  validate,
];

// Fair validators
const fairValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  validate,
];

// Caseta validators
const casetaValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('number')
    .notEmpty().withMessage('Number is required')
    .isInt({ min: 1 }).withMessage('Number must be a positive integer'),
  body('fair')
    .notEmpty().withMessage('Fair is required')
    .isMongoId().withMessage('Fair must be a valid ID'),
  validate,
];

// Menu validators
const menuValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('caseta')
    .notEmpty().withMessage('Caseta is required')
    .isMongoId().withMessage('Caseta must be a valid ID'),
  validate,
];

// Concert validators
const concertValidator = [
  body('artist')
    .notEmpty().withMessage('Artist is required')
    .isLength({ min: 2, max: 100 }).withMessage('Artist must be between 2 and 100 characters'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
  body('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('caseta')
    .notEmpty().withMessage('Caseta is required')
    .isMongoId().withMessage('Caseta must be a valid ID'),
  validate,
];

// Fair validators for PUT (all optional)
const fairUpdateValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  validate,
];

// Caseta validators for PUT (all optional)
const casetaUpdateValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('number')
    .optional()
    .isInt({ min: 1 }).withMessage('Number must be a positive integer'),
  body('fair')
    .optional()
    .isMongoId().withMessage('Fair must be a valid ID'),
  validate,
];

// Bulk caseta create/update (e.g. after reviewing map detection)
const bulkCasetasValidator = [
  body('casetas')
    .isArray({ min: 1 }).withMessage('casetas must be a non-empty array'),
  body('casetas.*.number')
    .isInt({ min: 1 }).withMessage('Each caseta number must be a positive integer'),
  body('casetas.*.location.x')
    .isNumeric().withMessage('Each caseta location.x must be a number'),
  body('casetas.*.location.y')
    .isNumeric().withMessage('Each caseta location.y must be a number'),
  body('fair')
    .optional()
    .isMongoId().withMessage('Fair must be a valid ID'),
  validate,
];

// Menu validators for PUT (all optional)
const menuUpdateValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('caseta')
    .optional()
    .isMongoId().withMessage('Caseta must be a valid ID'),
  validate,
];

// Concert validators for PUT (all optional)
const concertUpdateValidator = [
  body('artist')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Artist must be between 2 and 100 characters'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('caseta')
    .optional()
    .isMongoId().withMessage('Caseta must be a valid ID'),
  validate,
];

module.exports = {
  loginValidator,
  registerValidator,
  roleUpdateValidator,
  fairValidator,
  fairUpdateValidator,
  casetaValidator,
  casetaUpdateValidator,
  bulkCasetasValidator,
  menuValidator,
  menuUpdateValidator,
  concertValidator,
  concertUpdateValidator,
};