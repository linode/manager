// This file is where we override Vite types for env typesafety
// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript

interface ImportMetaEnv {
  BASE_URL: string;
  DEV: boolean;
  MODE: string;
  PROD: boolean;
  REACT_APP_ACCESS_TOKEN?: string;
  REACT_APP_ADOBE_ANALYTICS_URL?: string;
  REACT_APP_ALGOLIA_APPLICATION_ID?: string;
  REACT_APP_ALGOLIA_SEARCH_KEY?: string;
  REACT_APP_API_MAX_PAGE_SIZE?: number;
  REACT_APP_API_ROOT?: string;
  REACT_APP_APP_ROOT?: string;
  REACT_APP_CLIENT_ID?: string;
  REACT_APP_DISABLE_EVENT_THROTTLE?: boolean;
  REACT_APP_DISABLE_NEW_RELIC?: boolean;
  REACT_APP_ENABLE_DEV_TOOLS?: boolean;
  REACT_APP_ENABLE_MAINTENANCE_MODE?: string;
  REACT_APP_FORCE_SEARCH_TYPE?: 'api' | 'client';
  REACT_APP_GPAY_ENV?: 'PRODUCTION' | 'TEST';
  REACT_APP_GPAY_MERCHANT_ID?: string;
  REACT_APP_LAUNCH_DARKLY_ID?: string;
  REACT_APP_LOG_PERFORMANCE_METRICS?: string;
  REACT_APP_LOGIN_ROOT?: string;
  REACT_APP_MOCK_SERVICE_WORKER?: string;
  REACT_APP_PAYPAL_CLIENT_ID?: string;
  REACT_APP_PAYPAL_ENV?: string;
  REACT_APP_PENDO_API_KEY?: string;
  // TODO: Parent/Child - Remove once we're off mocks.
  REACT_APP_PROXY_PAT?: string;
  REACT_APP_SENTRY_URL?: string;
  REACT_APP_STATUS_PAGE_URL?: string;
  SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const src: ComponentClass<any, any>;
  export default src;
}

declare module '*?raw' {
  const src: string;
  export default src;
}
