import { clearAuthToken } from '../store/appStore'
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
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiClientRequestOptions = {},
): Promise<TResponse> {
  const method = options.method ?? 'GET'
  const headers = buildRequestHeaders({
    authRequired: options.authRequired ?? true,
    brokerRequired: options.brokerRequired ?? true,
    headers: options.headers,
  })

  const body = createRequestBody(options.body)

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(createRequestUrl(path, options.query), {
      method,
      headers,
      body,
      signal: options.signal,
    })
  } catch (error) {
    throw createNetworkError(error)
  }

  if (!response.ok) {
    throw await createResponseError(response)
  }

  return parseResponse<TResponse>(response)
}

function createRequestUrl(path: string, query?: ApiClientRequestOptions['query']): string {
  const url = new URL(path, apiBaseUrl)

  if (query !== undefined) {
    Object.entries(query).forEach(([key, value]) => {
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
  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

async function createResponseError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    clearAuthToken()

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
  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function createNetworkError(error: unknown): ApiError {
  return {
    message: 'Network request failed.',
    category: 'network',
    details: error,
  }
}
