// OAuth Apps storage utilities using localStorage
// Persists OAuth apps created via the setup wizard

const OAUTH_APPS_STORAGE_KEY = 'dev-settings-oauth-apps';

import { OAuthApp } from '@/types/apiKeys';

/**
 * Get all OAuth apps from localStorage
 */
export function getStoredOAuthApps(): OAuthApp[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(OAUTH_APPS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Add a new OAuth app to localStorage
 */
export function addStoredOAuthApp(app: OAuthApp): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getStoredOAuthApps();
    const updated = [app, ...existing];
    localStorage.setItem(OAUTH_APPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to store OAuth app:', error);
  }
}

/**
 * Update an OAuth app in localStorage
 */
export function updateStoredOAuthApp(appId: string, updates: Partial<OAuthApp>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getStoredOAuthApps();
    const updated = existing.map((app) =>
      app.id === appId ? { ...app, ...updates } : app
    );
    localStorage.setItem(OAUTH_APPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update OAuth app:', error);
  }
}

/**
 * Delete an OAuth app from localStorage
 */
export function deleteStoredOAuthApp(appId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getStoredOAuthApps();
    const updated = existing.filter((app) => app.id !== appId);
    localStorage.setItem(OAUTH_APPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete OAuth app:', error);
  }
}

/**
 * Clear all stored OAuth apps (for testing/reset)
 */
export function clearStoredOAuthApps(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OAUTH_APPS_STORAGE_KEY);
}
