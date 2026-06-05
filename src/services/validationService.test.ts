import { describe, expect, it, vi } from 'vitest'
import { createValidationApiError, validateDateRange } from './validationService'

describe('validationService', () => {
  it('accepts a valid date range', () => {
    expect(validateDateRange({ fromDate: '2026-01-01', toDate: '2026-01-31' })).toEqual({
      isValid: true,
      errors: [],
    })
  })

  it('rejects invalid date formats', () => {
    expect(validateDateRange({ fromDate: '01-01-2026', toDate: '2026-01-31' }).errors).toEqual([
      { field: 'fromDate', message: 'Date must use YYYY-MM-DD format.', code: 'DATE_FORMAT_INVALID' },
    ])
  })

  it('rejects non-calendar dates', () => {
    expect(validateDateRange({ fromDate: '2026-02-31', toDate: '2026-03-01' }).errors).toEqual([
      { field: 'fromDate', message: 'Date must be a valid calendar date.', code: 'DATE_FORMAT_INVALID' },
    ])
  })

  it('rejects future dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-06T12:00:00.000Z'))

    expect(validateDateRange({ fromDate: '2026-06-07', toDate: '2026-06-07' }).errors).toEqual([
      { field: 'fromDate', message: 'Date cannot be in the future.', code: 'DATE_IN_FUTURE' },
      { field: 'toDate', message: 'Date cannot be in the future.', code: 'DATE_IN_FUTURE' },
    ])

    vi.useRealTimers()
  })

  it('rejects ranges where from date is after to date', () => {
    expect(validateDateRange({ fromDate: '2026-02-01', toDate: '2026-01-31' }).errors).toEqual([
      {
        field: 'fromDate',
        message: 'From date must be before or equal to to date.',
        code: 'DATE_RANGE_INVALID',
      },
    ])
  })

  it('rejects empty date strings', () => {
    expect(validateDateRange({ fromDate: '', toDate: '' }).errors).toEqual([
      { field: 'fromDate', message: 'Date is required.', code: 'DATE_REQUIRED' },
      { field: 'toDate', message: 'Date is required.', code: 'DATE_REQUIRED' },
    ]);
  });

  it('rejects whitespace only date strings', () => {
    expect(validateDateRange({ fromDate: '   ', toDate: '  ' }).errors).toEqual([
      { field: 'fromDate', message: 'Date is required.', code: 'DATE_REQUIRED' },
      { field: 'toDate', message: 'Date is required.', code: 'DATE_REQUIRED' },
    ]);
  });

  it('creates validation API errors', () => {
    const validation = validateDateRange({ fromDate: 'bad', toDate: '2026-01-31' })

    expect(createValidationApiError(validation)).toEqual({
      message: 'Validation failed.',
      category: 'validation',
      code: 'VALIDATION_FAILED',
      details: validation,
    })
  })
})
