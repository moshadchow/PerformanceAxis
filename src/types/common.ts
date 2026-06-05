export type DateString = string

export interface DateRange {
  fromDate: DateString
  toDate: DateString
}

export type ApiRequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export type ApiErrorCategory = 'auth' | 'cancelled' | 'client' | 'network' | 'server' | 'unknown' | 'validation'

export interface ApiError {
  message: string
  category: ApiErrorCategory
  statusCode?: number
  code?: string
  details?: unknown
}

export interface ApiRequestState<TData> {
  status: ApiRequestStatus
  data: TData | null
  error: ApiError | null
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
