const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Add ngrok bypass headers if using ngrok
    const isNgrok = API_BASE_URL.includes('ngrok');
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(isNgrok ? {
        'ngrok-skip-browser-warning': 'any',
      } : {}),
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
    });

    // Read response body once (can only be read once)
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    
    // Check if response is HTML (ngrok warning page or error page)
    if (contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('[API Request] Received HTML instead of JSON:', {
        url,
        status: response.status,
        contentType,
        preview: text.substring(0, 200),
      });
      
      // Check if it's the ngrok warning page
      if (text.includes('ngrok') || text.includes('Visit Site')) {
        const helpMessage = `Ngrok warning page detected. Solutions:
1. Visit ${url} in your browser and click "Visit Site", then refresh this page
2. Restart ngrok with: ngrok http 3001 --host-header=rewrite
3. Use localhost: Update .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001`;
        
        throw new ApiError(
          helpMessage,
          response.status,
          { isNgrokWarning: true, url },
        );
      }
      
      throw new ApiError(
        `Server returned HTML instead of JSON. This might be an error page. Check: ${url}`,
        response.status,
        { htmlResponse: text.substring(0, 500) },
      );
    }

    if (!response.ok) {
      // Try to parse as JSON, but handle HTML responses gracefully
      let errorData = {};
      try {
        // Check if it's HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new ApiError(
            `Server returned HTML error page (status ${response.status}). Check: ${url}`,
            response.status,
            { htmlResponse: text.substring(0, 500) },
          );
        }
        errorData = JSON.parse(text);
      } catch (parseError) {
        // If parsing fails, it might be HTML or invalid JSON
        if (parseError instanceof ApiError) {
          throw parseError;
        }
        console.error('[API Request] Failed to parse error response:', parseError);
      }
      
      throw new ApiError(
        errorData.message || `API request failed: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    // Parse JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If it's HTML that wasn't caught earlier
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('[API Request] Response is HTML instead of JSON:', text.substring(0, 200));
        throw new ApiError(
          `Server returned HTML instead of JSON. This might be an ngrok warning page. Visit ${url} in your browser first.`,
          response.status,
          { htmlResponse: text.substring(0, 500) },
        );
      }
      throw parseError;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('[API Request] JSON parse error - likely HTML response:', { url, error });
      throw new ApiError(
        `Received invalid JSON response. This might be an ngrok warning page. Please visit ${url} in your browser first and click "Visit Site", then try again.`,
        0,
        { originalError: error.message, url },
      );
    }
    
    // Network error or CORS issue
    console.error('[API Request Failed]', { url, error, apiBaseUrl: API_BASE_URL });
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Failed to fetch'}. Please check if the API server is running at ${API_BASE_URL}`,
      0,
      { originalError: error instanceof Error ? error.message : String(error) },
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    }),

  put: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    }),

  delete: <T>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', headers }),

  upload: async <T>(endpoint: string, formData: FormData, headers?: HeadersInit): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Log what we're sending for debugging
    console.log('[API Upload]', { 
      url, 
      apiBaseUrl: API_BASE_URL,
      hasFile: formData.has('file'),
      formDataKeys: Array.from(formData.keys()),
    });
    
    try {
      // Add ngrok bypass headers if using ngrok
      const isNgrok = API_BASE_URL.includes('ngrok');
      const requestHeaders: HeadersInit = {
        ...(isNgrok ? {
          'ngrok-skip-browser-warning': 'any',
        } : {}),
        ...headers,
        // Don't set Content-Type, let the browser set it with boundary
      };
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: requestHeaders,
      });

      // Check if response is HTML (ngrok warning page or error page)
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      if (contentType.includes('text/html') || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('[API Upload] Received HTML instead of JSON:', text.substring(0, 500));
        
        // Check if it's the ngrok warning page
        if (text.includes('ngrok') || text.includes('Visit Site')) {
          const helpMessage = `Ngrok warning page detected. Solutions:
1. Visit ${url} in your browser and click "Visit Site", then try uploading again
2. Restart ngrok with: ngrok http 3001 --host-header=rewrite
3. Use localhost: Update .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001`;
          
          throw new ApiError(
            helpMessage,
            response.status,
            { isNgrokWarning: true, url, htmlResponse: text.substring(0, 500) },
          );
        }
        
        throw new ApiError(
          `Server returned HTML instead of JSON. This might be an error page. Check: ${url}`,
          response.status,
          { htmlResponse: text.substring(0, 500) },
        );
      }

      if (!response.ok) {
        // Try to parse as JSON, but handle HTML responses gracefully
        let errorData = {};
        try {
          // Check if it's HTML
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new ApiError(
              `Server returned HTML error page (status ${response.status}). Check: ${url}`,
              response.status,
              { htmlResponse: text.substring(0, 500) },
            );
          }
          errorData = JSON.parse(text);
        } catch (parseError) {
          if (parseError instanceof ApiError) {
            throw parseError;
          }
          console.error('[API Upload] Failed to parse error response:', parseError);
        }
        
        throw new ApiError(
          errorData.message || `API request failed: ${response.statusText}`,
          response.status,
          errorData,
        );
      }

      // Parse JSON response
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If it's HTML that wasn't caught earlier
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.error('[API Upload] Response is HTML instead of JSON:', text.substring(0, 200));
          throw new ApiError(
            `Server returned HTML instead of JSON. This might be an ngrok warning page. Visit ${url} in your browser first.`,
            response.status,
            { htmlResponse: text.substring(0, 500) },
          );
        }
        throw parseError;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Network error or CORS issue
      console.error('[API Upload Failed]', { 
        url, 
        error, 
        apiBaseUrl: API_BASE_URL,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      
      // More specific error messages
      let errorMessage = 'Failed to upload content';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = `Cannot connect to API server at ${API_BASE_URL}. Please check:
1. Is the API server running? (cd apps/api && npm run start:dev)
2. Is ngrok tunnel active? (Check if ngrok is running and pointing to port 3001)
3. Is the ngrok URL correct in .env.local? (NEXT_PUBLIC_API_URL=${API_BASE_URL})
4. Try accessing ${API_BASE_URL}/content in your browser to verify the server is reachable`;
      } else {
        errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      throw new ApiError(
        errorMessage,
        0,
        { originalError: error instanceof Error ? error.message : String(error) },
      );
    }
  },
};

