const API_BASE_URL = 'https://prime-top-place.ru/api'

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options

    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...(fetchOptions.headers as HeadersInit),
    }

    // Добавляем токен авторизации если он есть
    if (!skipAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        mode: 'cors',
        headers,
      })

      // Обработка ошибок
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText || 'Произошла ошибка',
        }))
        throw new Error(errorData.message || errorData.error || 'Произошла ошибка')
      }

      // Если ответ пустой (например, при удалении)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Произошла неизвестная ошибка')
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

