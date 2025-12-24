import Joi from 'joi';
import { BadRequestError } from '../core/error.response.js';
import RegisterUserDto from '../dtos/register-user.dto.js';
import LoginUserDto from '../dtos/login-user.dto.js';

// Schema for user registration
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Name must be a text string',
    'string.empty': 'Name is not allowed to be empty',
    'string.min': 'Name must have at least {#limit} characters',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is a required field',
    }),
});

// Schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is a required field',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is a required field',
  }),
});

/**
 * @desc Middleware to validate the request body against a Joi schema and create a DTO.
 * @param {Joi.Schema} schema The Joi schema to validate against.
 * @param {class} DtoClass The DTO class to instantiate.
 * @returns {function} Express middleware.
 */
const validateAndCreateDto = (schema, DtoClass) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    // If validation fails, throw a BadRequestError.
    // The error handling middleware will catch this and send the response.
    throw new BadRequestError(error.details[0].message);
  }
  // If validation is successful, create a new DTO and attach it to the request.
  req.dto = new DtoClass(value);
  next();
};
// Export ready-to-use validation middlewares
export const validateRegister = validateAndCreateDto(
  registerSchema,
  RegisterUserDto
);
export const validateLogin = validateAndCreateDto(loginSchema, LoginUserDto);

