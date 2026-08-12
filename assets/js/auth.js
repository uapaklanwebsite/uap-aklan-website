/**
 * Authentication Module for UAP Aklan Admin Portal
 * Uses Supabase Auth for Email + Password authentication, session checks, and logout.
 */
import { supabase } from './supabase.js';

/**
 * Signs in a user using Supabase Email + Password authentication.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ user: Object|null, error: Object|null }>}
 */
export async function login(email, password) {
  if (!email || !password) {
    return { user: null, error: new Error('Email and password are required.') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('[Auth] Login error:', error);
    return { user: null, error };
  }

  console.log('[Auth] Login successful for user:', data.user?.email);
  return { user: data.user, error: null };
}

/**
 * Signs out the currently authenticated user from Supabase and redirects to login page.
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[Auth] SignOut error:', error);
    } else {
      console.log('[Auth] User signed out successfully.');
    }
  } catch (err) {
    console.error('[Auth] Exception during signout:', err);
  } finally {
    window.location.href = '/uap-aklan-admin/login.html';
  }
}

/**
 * Checks if a valid authenticated user exists in Supabase.
 * Redirects to /uap-aklan-admin/login.html if no session is active.
 * @returns {Promise<Object|null>} The authenticated user object or null.
 */
export async function requireAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.warn('[Auth] No active session found. Redirecting to login.');
      window.location.href = '/uap-aklan-admin/login.html';
      return null;
    }

    console.log('[Auth] Active session verified for user:', user.email);
    return user;
  } catch (err) {
    console.error('[Auth] Error verifying session:', err);
    window.location.href = '/uap-aklan-admin/login.html';
    return null;
  }
}

/**
 * Checks if user is already authenticated when visiting login.html.
 * Redirects to /uap-aklan-admin/dashboard.html if session exists.
 */
export async function redirectIfAuthenticated() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      console.log('[Auth] User already authenticated. Redirecting to dashboard.');
      window.location.href = '/uap-aklan-admin/dashboard.html';
    }
  } catch (err) {
    console.error('[Auth] Error checking session on login page:', err);
  }
}
