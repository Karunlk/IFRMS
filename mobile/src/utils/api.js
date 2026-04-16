import Constants from 'expo-constants';
import { storage } from './storage';

/**
 * Base URL for the backend API.
 * On Android emulator, 10.0.2.2 is the host machine's loopback (localhost).
 * Set extra.apiBaseUrl in app.json (or EAS environment variables) for production.
 */
const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://10.0.2.2:3000/api';

// Registered by AppNavigator so a 401 triggers a logout + redirect.
let _unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  _unauthorizedHandler = fn;
}

export async function fetchApi(endpoint, options = {}) {
  const token = await storage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    await storage.clear();
    if (_unauthorizedHandler) _unauthorizedHandler();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}
