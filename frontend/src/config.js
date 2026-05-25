// Centralized API configuration for local development and public Render deployments
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE = `${BACKEND_URL}/api`;
