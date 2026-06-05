import { clearAuthToken } from '../store/appStore'
import { clearCache, getCachedValue, setCachedValue } from '../services/cacheService'
import type { ApiError } from '../types/common'
import { buildRequestHeaders } from './interceptors'

const apiBaseUrl = 'https://uat.xfltrade.com:20121'

export type ApiRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiClientRequestOptions {
  method?: ApiRequestMethod
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  headers?: Record<string, string>
  authRequired?: boolean
  brokerRequired?: boolean
  signal?: AbortSignal
  cacheKey?: string
  cacheTtlMs?: number
  skipCache?: boolean
  cancelPreviousGroupKey?: string
}

const inFlightRequests = new Map<string, Promise<unknown>>()
const requestControllers = new Map<string, AbortController>()

export async function apiRequest<TResponse>(
  path: string,
  options: ApiClientRequestOptions = {},
): Promise<TResponse> {
  validateApiPath(path)

  const method = options.method ?? 'GET'
  const requestKey = method === 'GET' ? createInFlightRequestKey(path, options) : null

  if (method === 'GET' && options.cacheKey !== undefined && options.skipCache !== true) {
    const cachedValue = getCachedValue<TResponse>(options.cacheKey)

    if (cachedValue !== null) {
      return cachedValue
    }
  }

  if (requestKey !== null) {
    const inFlightRequest = inFlightRequests.get(requestKey)

    if (inFlightRequest !== undefined) {
      return inFlightRequest as Promise<TResponse>
    }
  }

  const requestPromise = executeRequest<TResponse>(path, method, options)

  if (requestKey !== null) {
    inFlightRequests.set(requestKey, requestPromise)
  }

  try {
    const response = await requestPromise

    if (method === 'GET' && options.cacheKey !== undefined && options.skipCache !== true) {
      setCachedValue(options.cacheKey, response, options.cacheTtlMs)
    }

    return response
  } finally {
    if (requestKey !== null) {
      inFlightRequests.delete(requestKey)
    }
  }
}

export function resetApiClientForTests(): void {
  inFlightRequests.clear()
  requestControllers.forEach((controller) => controller.abort())
  requestControllers.clear()
}

async function executeRequest<TResponse>(
  path: string,
  method: ApiRequestMethod,
  options: ApiClientRequestOptions,
): Promise<TResponse> {
  const headers = buildRequestHeaders({
    authRequired: options.authRequired ?? true,
    brokerRequired: options.brokerRequired ?? true,
    headers: options.headers,
  })
  const body = createRequestBody(options.body)

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = createRequestController(options)

  let response: Response

  try {
    response = await fetch(createRequestUrl(path, options.query), {
      method,
      headers,
      body,
      signal: controller.signal,
    })
  } catch (error) {
    throw createFetchError(error)
  } finally {
    cleanupRequestController(options.cancelPreviousGroupKey, controller)
  }

  if (!response.ok) {
    throw await createResponseError(response)
  }

  return parseResponse<TResponse>(response)
}

function validateApiPath(path: string): void {
  if (!path.startsWith('/') || path.startsWith('//') || /^[a-z][a-z\d+.-]*:\/\//i.test(path)) {
    throw createClientError('API path must be a relative application path.', 'INVALID_API_PATH')
  }
}

function createRequestUrl(path: string, query?: ApiClientRequestOptions['query']): string {
  const url = new URL(path, apiBaseUrl)

  if (query !== undefined) {
    Object.entries(query)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      })
  }

  return url.toString()
}

function createRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }

  return JSON.stringify(body)
}

async function parseResponse<TResponse>(response: Response): Promise<TResponse> {
  if (response.status === 204 || response.status === 205) {
    return undefined as TResponse
  }

  const responseText = await response.text()

  if (responseText.length === 0) {
    return undefined as TResponse
  }

  try {
    return JSON.parse(responseText) as TResponse
  } catch (error) {
    const contentType = response.headers.get('Content-Type') ?? ''

    if (contentType.includes('application/json')) {
      throw createParseError(error)
    }

    return responseText as TResponse
  }
}

async function createResponseError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    clearAuthToken()
    clearCache()

    return {
      message: 'Session expired, please log in again.',
      category: 'auth',
      statusCode: response.status,
      code: 'AUTH_TOKEN_EXPIRED',
      details: await readResponseDetails(response),
    }
  }

  return {
    message: `Request failed with status ${response.status}.`,
    category: response.status >= 500 ? 'server' : 'client',
    statusCode: response.status,
    details: await readResponseDetails(response),
  }
}

async function readResponseDetails(response: Response): Promise<unknown> {
  const responseText = await response.text()

  if (responseText.length === 0) {
    return null
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(responseText)
    } catch {
      return responseText
    }
  }

  return responseText
}

function createRequestController(options: ApiClientRequestOptions): AbortController {
  const controller = new AbortController()

  if (options.cancelPreviousGroupKey !== undefined) {
    requestControllers.get(options.cancelPreviousGroupKey)?.abort()
    requestControllers.set(options.cancelPreviousGroupKey, controller)
  }

  if (options.signal !== undefined) {
    if (options.signal.aborted) {
      controller.abort()
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  return controller
}

function cleanupRequestController(groupKey: string | undefined, controller: AbortController): void {
  if (groupKey !== undefined && requestControllers.get(groupKey) === controller) {
    requestControllers.delete(groupKey)
  }
}

function createInFlightRequestKey(path: string, options: ApiClientRequestOptions): string {
  return options.cacheKey ?? createRequestUrl(path, options.query)
}

function createFetchError(error: unknown): ApiError {
  if (isAbortError(error)) {
    return {
      message: 'Request was cancelled.',
      category: 'cancelled',
      code: 'REQUEST_CANCELLED',
      details: error,
    }
  }

  return {
    message: 'Network request failed.',
    category: 'network',
    details: error,
  }
}

function createParseError(error: unknown): ApiError {
  return {
    message: 'Failed to parse API response.',
    category: 'client',
    code: 'RESPONSE_PARSE_FAILED',
    details: error,
  }
}

function createClientError(message: string, code: string): ApiError {
  return {
    message,
    category: 'client',
    code,
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
