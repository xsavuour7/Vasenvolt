import { LoginCredentials, RegisterCredentials, TokenResponse, User } from '@/types/auth';
import { apiClient } from './client';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Register a new user (signup)
   */
  async register(credentials: RegisterCredentials): Promise<TokenResponse> {
    return apiClient.request<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.request<User>('/auth/me');
  },
};

