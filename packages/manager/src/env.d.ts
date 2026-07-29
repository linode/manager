/// <reference types="./vite.d.ts" />
/// <reference types="vite/client" />

// This file is where we override Vite types for env typesafety
// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript

interface ImportMetaEnv {
  COMPUTE_ACCESS_TOKEN?: string;
  COMPUTE_ADOBE_ANALYTICS_URL?: string;
  COMPUTE_ALGOLIA_APPLICATION_ID?: string;
  COMPUTE_ALGOLIA_SEARCH_KEY?: string;
  COMPUTE_API_ROOT?: string;
  COMPUTE_APP_ROOT?: string;
  COMPUTE_CHAT_BOOTSTRAP_JS_URL?: string;
  COMPUTE_CHAT_DEPLOYMENT_NAME?: string;
  COMPUTE_CHAT_DEPLOYMENT_URL?: string;
  COMPUTE_CHAT_ORG_ID?: string;
  COMPUTE_CHAT_SCRT2_URL?: string;
  COMPUTE_CLIENT_ID?: string;
  COMPUTE_DISABLE_NEW_RELIC?: boolean;
  COMPUTE_ENABLE_DEV_TOOLS?: boolean;
  COMPUTE_ENABLE_MAINTENANCE_MODE?: string;
  COMPUTE_ENVIRONMENT_NAME?: string;
  COMPUTE_FORCE_SEARCH_TYPE?: 'api' | 'client';
  COMPUTE_GPAY_ENV?: 'PRODUCTION' | 'TEST';
  COMPUTE_GPAY_MERCHANT_ID?: string;
  COMPUTE_LAUNCHDARKLY_CLIENT_ID?: string;
  COMPUTE_LOGIN_ROOT?: string;
  COMPUTE_PAYPAL_CLIENT_ID?: string;
  COMPUTE_PAYPAL_ENV?: string;
  COMPUTE_PENDO_API_KEY?: string;
  COMPUTE_PROXY_PAT?: string; // @TODO: Parent/Child - Remove once we're off mocks.
  COMPUTE_SENTRY_URL?: string;
  COMPUTE_STATUS_PAGE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'logic-query-parser';
declare module 'search-string';
