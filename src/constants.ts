const PRODUCTION = 'production';

export const GA_ID = process.env.REACT_APP_GA_ID;

export const isProduction = process.env.NODE_ENV === PRODUCTION;

export const APP_ROOT = process.env.REACT_APP_APP_ROOT || 'http://localhost:3000';
export const LOGIN_ROOT = process.env.REACT_APP_LOGIN_ROOT || 'https://login.linode.com';
export const API_ROOT = process.env.REACT_APP_API_ROOT || 'http://api.lindev.local';
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

export const SENTRY_URL = process.env.REACT_APP_SENTRY_URL;

export const LOGIN_SESSION_LIFETIME_MS = 45 * 60 * 1000;
export const OAUTH_TOKEN_REFRESH_TIMEOUT = LOGIN_SESSION_LIFETIME_MS / 2;
