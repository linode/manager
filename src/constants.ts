const PRODUCTION = 'production';

export const GA_ID = process.env.REACT_APP_GA_ID;

export const isProduction = process.env.NODE_ENV === PRODUCTION;

export const SENTRY_URL = process.env.REACT_APP_SENTRY_URL;
