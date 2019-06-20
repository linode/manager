const PRODUCTION = 'production';

/** native to webpack build */
export const isProduction = process.env.NODE_ENV === PRODUCTION;

/** required for the app to function */
export const APP_ROOT =
  process.env.REACT_APP_APP_ROOT || 'http://localhost:3000';
export const LOGIN_ROOT =
  process.env.REACT_APP_LOGIN_ROOT || 'https://login.linode.com';
export const API_ROOT =
  process.env.REACT_APP_API_ROOT || 'https://api.lindev.local';
export const LISH_ROOT =
  process.env.REACT_APP_LISH_ROOT || 'webconsole.linode.com';
/** generate a client_id by navigating to https://cloud.linode.com/profile/clients */
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
/** All of the following used specifically for Algolia search */
export const DOCS_BASE_URL = 'https://linode.com';
export const COMMUNITY_BASE_URL = 'https://linode.com/community/';
export const DOCS_SEARCH_URL = 'https://linode.com/docs/search/?q=';
export const COMMUNITY_SEARCH_URL =
  'https://linode.com/community/questions/search?query=';
export const ALGOLIA_APPLICATION_ID =
  process.env.REACT_APP_ALGOLIA_APPLICATION_ID || '';
export const ALGOLIA_SEARCH_KEY =
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY || '';

/** optional variables */
export const SENTRY_URL = process.env.REACT_APP_SENTRY_URL;
export const LOGIN_SESSION_LIFETIME_MS = 45 * 60 * 1000;
export const OAUTH_TOKEN_REFRESH_TIMEOUT = LOGIN_SESSION_LIFETIME_MS / 2;
/** Google Analytics and Tag Manager */
export const GA_ID = process.env.REACT_APP_GA_ID;
export const GTM_ID = process.env.REACT_APP_GTM_ID;
/** for hard-coding token used for API Requests. Example: "Bearer 1234" */
export const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

export const LOG_PERFORMANCE_METRICS =
  !isProduction && process.env.REACT_APP_LOG_PERFORMANCE_METRICS === 'true';

// Features
export const isObjectStorageEnabledForEnvironment =
  process.env.REACT_APP_IS_OBJECT_STORAGE_ENABLED === 'true';

export const isKubernetesEnabledForEnvironment =
  process.env.REACT_APP_KUBERNETES_ENABLED === 'true';

export const DISABLE_EVENT_THROTTLE =
  Boolean(process.env.REACT_APP_DISABLE_EVENT_THROTTLE) || false;

export const ISO_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const MAX_VOLUME_SIZE = 10240;

/**
 * Used by e.g. LISH to determine the websocket connection address.
 * Whenever updating this, also update the corresponding name in resolvers.ts
 */
export const ZONES: Record<string, Linode.ZoneName> = {
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
  'ca-central': 'toronto1',
  'ca-east': 'toronto1', // @todo Fallback for old Toronto ID; remove once DB has been updated.
  'ap-west': 'mumbai1'
};

export const dcDisplayNames = {
  'us-east-1a': 'Newark, NJ',
  'us-south-1a': 'Dallas, TX',
  'us-west-1a': 'Fremont, CA',
  'us-southeast-1a': 'Atlanta, GA',
  'eu-central-1a': 'Frankfurt, DE',
  'eu-west-1a': 'London, UK',
  'ap-northeast-1a': 'Tokyo, JP',
  'ap-northeast-1b': 'Tokyo 2, JP',
  'us-central': 'Dallas, TX',
  'us-west': 'Fremont, CA',
  'us-southeast': 'Atlanta, GA',
  'us-east': 'Newark, NJ',
  'eu-west': 'London, UK',
  'ap-south': 'Singapore, SG',
  'eu-central': 'Frankfurt, DE',
  'ap-northeast': 'Tokyo 2, JP',
  'ca-central': 'Toronto, ON',
  'ca-east': 'Toronto, ON', // @todo Fallback for old Toronto ID; remove once DB has been updated.
  'ap-west': 'Mumbai, IN'
};

export const dcDisplayCountry = {
  'us-east-1a': 'US',
  'us-south-1a': 'US',
  'us-west-1a': 'US',
  'us-southeast-1a': 'US',
  'eu-central-1a': 'DE',
  'eu-west-1a': 'UK',
  'ap-northeast-1a': 'JP',
  'ap-northeast-1b': 'JP',
  'us-central': 'US',
  'us-west': 'US',
  'us-southeast': 'US',
  'us-east': 'US',
  'eu-west': 'UK',
  'ap-south': 'SG',
  'eu-central': 'DE',
  'ap-northeast': 'JP',
  'ca-central': 'CA',
  'ca-east': 'CA',
  'ap-west': 'IN'
};

export type ContinentKey = 'NA' | 'EU' | 'AS';
export const dcContinent: Record<string, ContinentKey> = {
  'us-east-1a': 'NA',
  'us-south-1a': 'NA',
  'us-west-1a': 'NA',
  'us-southeast-1a': 'NA',
  'eu-central-1a': 'EU',
  'eu-west-1a': 'EU',
  'ap-northeast-1a': 'AS',
  'ap-northeast-1b': 'AS',
  'us-central': 'NA',
  'us-west': 'NA',
  'us-southeast': 'NA',
  'us-east': 'NA',
  'eu-west': 'EU',
  'ap-south': 'AS',
  'eu-central': 'EU',
  'ap-northeast': 'AS',
  'ca-central': 'NA',
  'ca-east': 'NA'
};

// At this time, the following regions do not support block storage.
export const regionsWithoutBlockStorage = ['us-southeast', 'ap-northeast-1a'];

// Default error message for non-API errors
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

export const allowedHTMLTags = [
  'a',
  'abbr',
  'acronym',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'hr',
  'i',
  'li',
  'ol',
  'ul',
  'p',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr'
];

export const allowedHTMLAttr = ['href', 'lang', 'title', 'align', 'target'];

// List of country codes in the European Union; used for VAT display
export const EU_COUNTRIES = [
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DE', // Germany
  'DK', // Denmark
  'EE', // Estonia
  'ES', // Spain
  'FI', // Finland
  'FR', // France
  'GR', // Greece
  'HR', // Croatia
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LT', // Lithuania
  'LU', // Luxembourg
  'LV', // Latvia
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SE', // Sweden
  'SI', // Slovenia
  'SK', // Slovakia
  'GB' // United Kingdom
];
