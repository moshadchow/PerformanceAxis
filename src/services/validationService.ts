import type { DateRange, ApiError, ValidationError, ValidationResult } from '../types/common'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export function validateDateRange(dateRange: DateRange): ValidationResult {
  const errors: ValidationError[] = [
    ...validateDateField('fromDate', dateRange.fromDate),
    ...validateDateField('toDate', dateRange.toDate),
  ]

  if (errors.length === 0 && dateRange.fromDate > dateRange.toDate) {
    errors.push({
      field: 'fromDate',
      message: 'From date must be before or equal to to date.',
      code: 'DATE_RANGE_INVALID',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function createValidationApiError(validation: ValidationResult): ApiError {
  return {
    message: 'Validation failed.',
    category: 'validation',
    code: 'VALIDATION_FAILED',
    details: validation,
  }
}

function validateDateField(field: keyof DateRange, value: string): ValidationError[] {
  const errors: ValidationError[] = []

  // Reject empty or whitespace‑only strings
  if (!value || value.trim() === '') {
    errors.push({ field, message: 'Date is required.', code: 'DATE_REQUIRED' })
    return errors
  }

  // Validate format (YYYY‑MM‑DD)
  if (!datePattern.test(value)) {
    errors.push({ field, message: 'Date must use YYYY-MM-DD format.', code: 'DATE_FORMAT_INVALID' })
    return errors
  }

  // Validate calendar date (e.g., reject 2026‑02‑31)
  if (!isValidCalendarDate(value)) {
    errors.push({ field, message: 'Date must be a valid calendar date.', code: 'DATE_FORMAT_INVALID' })
    return errors
  }

  // Future date check
  if (value > getTodayDateString()) {
    errors.push({ field, message: 'Date cannot be in the future.', code: 'DATE_IN_FUTURE' })
  }

  return errors
}

function isValidCalendarDate(value: string): boolean {
  const [yearPart, monthPart, dayPart] = value.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
