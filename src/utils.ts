import { ValidationError } from 'ajv'

export const isValidationError = (o?: unknown): o is ValidationError =>
  o instanceof ValidationError
