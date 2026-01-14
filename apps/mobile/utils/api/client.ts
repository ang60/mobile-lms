const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
    message?: string
  ) {
    super(message || `HTTP ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options;
  const url = `${BASE_URL}${path}`;

  try {
    console.log('[apiFetch] request', { method, url, body: body ? '***' : undefined });
    
    const response = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any', // Bypass ngrok warning page
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Check if response is HTML (ngrok warning page)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const html = await response.text();
      if (html.includes('ngrok') || html.includes('ERR_NGROK')) {
        throw new Error(
          'Ngrok tunnel error: The tunnel may be offline or pointing to the wrong port. ' +
          'Please check that ngrok is running and pointing to port 3000.'
        );
      }
    }

    // Handle 204 No Content
    if (response.status === 204) {
      console.log('[apiFetch] response', { status: response.status, body: null });
      return undefined as unknown as T;
    }

    // Parse response body
    let responseBody: any;
    try {
      const text = await response.text();
      responseBody = text ? JSON.parse(text) : null;
    } catch (parseError) {
      responseBody = null;
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.warn('[apiFetch] HTTP error', { 
        status: response.status, 
        statusText: response.statusText, 
        body: responseBody 
      });
      
      // 401 Unauthorized is a valid response, not a network failure
      if (response.status === 401) {
        throw new ApiError(
          response.status,
          response.statusText,
          JSON.stringify(responseBody),
          'Unauthorized: Authentication required'
        );
      }
      
      // Other HTTP errors
      throw new ApiError(
        response.status,
        response.statusText,
        JSON.stringify(responseBody),
        `HTTP ${response.status}: ${responseBody?.message || response.statusText}`
      );
    }

    console.log('[apiFetch] response', { status: response.status, body: responseBody });
    return responseBody as T;
  } catch (error) {
    // Only log as network failure if it's an actual network error
    if (error instanceof ApiError) {
      // Re-throw API errors as-is
      throw error;
    }
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[apiFetch] network failure', { method, url, error: error.message });
      throw new Error(
        `Network request failed: Unable to reach ${url}. ` +
        'Please check your internet connection and ensure the API server is running.'
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}

