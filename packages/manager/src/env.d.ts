/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_API_ROOT: string;
  readonly REACT_APP_LOGIN_ROOT: string;
  readonly REACT_APP_GA_ID: string;
  readonly REACT_APP_GTM_ID: string;
  readonly REACT_APP_CLIENT_ID?: string;
  readonly REACT_APP_SENTRY_URL?: string;
  readonly REACT_APP_LISH_ROOT?: string;
  readonly REACT_APP_ALGOLIA_APPLICATION_ID?: string;
  readonly REACT_APP_GPAY_MERCHANT_ID?: string;
  readonly REACT_APP_PAYPAL_CLIENT_ENV?: string;
  readonly REACT_APP_PAYPAL_CLIENT_ID?: string;
  readonly REACT_APP_LAUNCH_DARKLY_ID?: string;
  readonly REACT_APP_ALGOLIA_SEARCH_KEY?: string;
  readonly REACT_APP_PAYPAL_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
