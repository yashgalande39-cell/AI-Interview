/**
 * TRESK AI — Centralised Request Validation
 * =====================================================================
 * All API request bodies are validated here using Joi before they
 * reach any controller. Import `validate` middleware and the relevant
 * schema to protect a route.
 *
 * Usage:
 *   const { validate, schemas } = require('../../utils/validate');
 *   router.post('/register', validate(schemas.auth.register), auth.register);
 */

const Joi = require('joi');

// ── Generic middleware factory ────────────────────────────────────────────────
/**
 * Returns an Express middleware that validates req.body against `schema`.
 * On failure it responds 400 with the first validation error message.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,      // stop at the first error
    allowUnknown: false,   // reject unknown keys (prevents mass assignment)
    stripUnknown: true,    // silently remove fields not in schema
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Replace req.body with sanitised, typed values
  req.body = value;
  next();
};

// ── Reusable field definitions ────────────────────────────────────────────────
const password = Joi.string().min(6).max(128).required();
const email    = Joi.string().email().max(254).lowercase().trim().required();

// ── Schema catalogue ──────────────────────────────────────────────────────────
const schemas = {

  auth: {
    register: Joi.object({
      name:           Joi.string().min(2).max(100).trim().required(),
      email,
      password,
      collegeName:    Joi.string().max(150).allow('').optional(),
      branch:         Joi.string().max(100).allow('').optional(),
      graduationYear: Joi.string().max(10).allow('').optional(),
    }),

    login: Joi.object({
      email,
      password: Joi.string().max(128).required(),
    }),

    googleAuth: Joi.object({
      idToken: Joi.string().required(),
    }),

    changePassword: Joi.object({
      currentPassword: Joi.string().max(128).required(),
      newPassword:     password,
    }),

    updateProfile: Joi.object({
      name:           Joi.string().min(2).max(100).trim().optional(),
      currentRole:    Joi.string().max(100).allow('').optional(),
      location:       Joi.string().max(100).allow('').optional(),
      bio:            Joi.string().max(500).allow('').optional(),
      collegeName:    Joi.string().max(150).allow('').optional(),
      branch:         Joi.string().max(100).allow('').optional(),
      graduationYear: Joi.string().max(10).allow('').optional(),
    }),

    forgotPassword: Joi.object({
      email,
    }),

    resetPassword: Joi.object({
      token:       Joi.string().required(),
      newPassword: password,
    }),

    deleteAccount: Joi.object({
      password: Joi.string().max(128).required(),
    }),
  },

  billing: {
    createOrder: Joi.object({
      plan: Joi.string().valid('pro', 'teams').required(),
    }),

    verifyPayment: Joi.object({
      orderId:   Joi.string().required(),
      paymentId: Joi.string().required(),
      signature: Joi.string().allow('').optional(), // may be empty in demo mode
      // NOTE: plan is now derived server-side from the order, not trusted from client
    }),
  },

  interview: {
    start: Joi.object({
      company:    Joi.string().max(100).allow('').optional(),
      role:       Joi.string().max(100).allow('').optional(),
      type:       Joi.string().valid('hr','technical','behavioral','system_design','aptitude','coding').required(),
    }),
  },

  coding: {
    run: Joi.object({
      code:      Joi.string().max(50000).required(),
      language:  Joi.string().valid('javascript','python','java','cpp','c','typescript','go','rust','ruby').required(),
      problemId: Joi.string().max(100).optional(),
    }),

    submit: Joi.object({
      code:      Joi.string().max(50000).required(),
      language:  Joi.string().valid('javascript','python','java','cpp','c','typescript','go','rust','ruby').required(),
      problemId: Joi.string().max(100).required(),
    }),
  },
};

module.exports = { validate, schemas };
