/**
 * Centralized API Client
 * Wraps all backend calls with auth headers, JSON handling, and error normalization.
 * Use these helpers instead of raw fetch() throughout the app.
 */
import { API_BASE } from '../config';

/** @returns {string} JWT token from localStorage */
const getToken = () => localStorage.getItem('token') || '';

/** Build standard request headers */
const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
  ...extra,
});

/**
 * Core fetch wrapper — parses JSON and throws structured errors.
 * @param {string} endpoint - Path relative to API_BASE e.g. '/interviews/history'
 * @param {RequestInit} options - fetch options
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: headers(options.headers),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const err = new Error(data?.message || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/** GET /api/<endpoint> */
export const apiGet = (endpoint) =>
  apiFetch(endpoint, { method: 'GET' });

/** POST /api/<endpoint> with JSON body */
export const apiPost = (endpoint, body) =>
  apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

/** PUT /api/<endpoint> with JSON body */
export const apiPut = (endpoint, body) =>
  apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

/** DELETE /api/<endpoint> */
export const apiDelete = (endpoint) =>
  apiFetch(endpoint, { method: 'DELETE' });

/**
 * Upload a file via multipart/form-data.
 * Note: Do NOT set Content-Type header manually — browser handles boundary.
 */
export const apiUpload = (endpoint, formData) => {
  const url = `${API_BASE}${endpoint}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  }).then(async (response) => {
    const data = await response.json().catch(() => ({ message: response.statusText }));
    if (!response.ok) {
      const err = new Error(data?.message || `Upload failed with status ${response.status}`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  });
};
