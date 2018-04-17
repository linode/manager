const PRODUCTION = 'production';

export const GA_ID = process.env.REACT_APP_GA_ID;

export const isProduction = process.env.NODE_ENV === PRODUCTION;

export const APP_ROOT = process.env.REACT_APP_APP_ROOT || 'http://localhost:3000';
export const LOGIN_ROOT = process.env.REACT_APP_LOGIN_ROOT || 'https://login.linode.com';
export const API_ROOT = process.env.REACT_APP_API_ROOT || 'https://api.lindev.local';
export const LISH_ROOT = process.env.REACT_APP_LISH_ROOT || 'webconsole.linode.com';
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

export const SENTRY_URL = process.env.REACT_APP_SENTRY_URL;

export const LOGIN_SESSION_LIFETIME_MS = 45 * 60 * 1000;
export const OAUTH_TOKEN_REFRESH_TIMEOUT = LOGIN_SESSION_LIFETIME_MS / 2;

export const ZONES = {
  'us-east': 'newark',
  'us-east-1a': 'newark',
  'us-south': 'dallas',
  'us-south-1a': 'dallas',
  'us-west': 'fremont',
  'us-west-1a': 'fremont',
  'us-central': 'dallas',
  'us-southeast': 'atlanta',
  'us-southeast-1a': 'atlanta',
  'eu-central': 'frankfurt',
  'eu-central-1a': 'frankfurt',
  'eu-west': 'london',
  'eu-west-1a': 'london',
  'ap-northeast': 'shinagawa1',
  'ap-northeast-1a': 'tokyo',
  'ap-northeast-1b': 'shinagawa1',
  'ap-south': 'singapore',
  'ap-south-1a': 'singapore',
};

export const dcDisplayNames = {
  'us-east-1a': 'Newark, NJ',
  'us-south-1a': 'Dallas, TX',
  'us-west-1a': 'Fremont, CA',
  'us-southeast-1a': 'Atlanta, GA',
  'eu-central-1a': 'Frankfurt, DE',
  'eu-west-1a': 'London, UK',
  'ap-northeast-1a': 'Tokyo',
  'ap-northeast-1b': 'Tokyo 2, JP',
  'us-central': 'Dallas, TX',
  'us-west': 'Fremont, CA',
  'us-southeast': 'Atlanta, GA',
  'us-east': 'Newark, NJ',
  'eu-west': 'London, UK',
  'ap-south': 'Singapore, SG',
  'eu-central': 'Frankfurt, DE',
  'ap-northeast': 'Tokyo 2, JP',
};
