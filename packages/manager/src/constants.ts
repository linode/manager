import { getBooleanEnv } from './utilities/env';

// whether or not this is a Vite production build
// This does not necessarily mean Cloud is running in a production environment.
// For example, cloud.dev.linode.com is technically a production build.
export const isProductionBuild = import.meta.env.PROD;

// allow us to explicity enable dev tools
export const ENABLE_DEV_TOOLS = getBooleanEnv(
  import.meta.env.REACT_APP_ENABLE_DEV_TOOLS
);

// allow us to explicity enable maintenance mode
export const ENABLE_MAINTENANCE_MODE =
  import.meta.env.REACT_APP_ENABLE_MAINTENANCE_MODE === 'true';

/** required for the app to function */
export const APP_ROOT =
  import.meta.env.REACT_APP_APP_ROOT || 'http://localhost:3000';
export const LOGIN_ROOT =
  import.meta.env.REACT_APP_LOGIN_ROOT || 'https://login.linode.com';
export const API_ROOT =
  import.meta.env.REACT_APP_API_ROOT || 'https://api.linode.com/v4';
export const BETA_API_ROOT = API_ROOT + 'beta';
export const LISH_ROOT =
  import.meta.env.REACT_APP_LISH_ROOT || 'webconsole.linode.com';
/** generate a client_id by navigating to https://cloud.linode.com/profile/clients */
export const CLIENT_ID = import.meta.env.REACT_APP_CLIENT_ID;
/** All of the following used specifically for Algolia search */
export const DOCS_BASE_URL = 'https://linode.com';
export const COMMUNITY_BASE_URL = 'https://linode.com/community/';
export const DOCS_SEARCH_URL =
  'https://www.linode.com/docs/topresults/?docType=products%2Cguides%2Capi%2Creference-architecture&lndq=';
export const COMMUNITY_SEARCH_URL =
  'https://linode.com/community/questions/search?query=';
export const ALGOLIA_APPLICATION_ID =
  import.meta.env.REACT_APP_ALGOLIA_APPLICATION_ID || '';
export const ALGOLIA_SEARCH_KEY =
  import.meta.env.REACT_APP_ALGOLIA_SEARCH_KEY || '';
export const LAUNCH_DARKLY_API_KEY =
  import.meta.env.REACT_APP_LAUNCH_DARKLY_ID || '';
export const LINODE_STATUS_PAGE_URL =
  import.meta.env.REACT_APP_STATUS_PAGE_URL ||
  'https://status.linode.com/api/v2';

// Maximum page size allowed by the API. Used in the `getAll()` helper function
// to request as many items at once as possible.
export const API_MAX_PAGE_SIZE =
  Number(import.meta.env.REACT_APP_API_MAX_PAGE_SIZE) || 500;

// Having more of a single entity than this number classifies you as having
// a "large account".
export const LARGE_ACCOUNT_THRESHOLD = 1500;

// PayPal Client ID
export const PAYPAL_CLIENT_ID =
  import.meta.env.REACT_APP_PAYPAL_CLIENT_ID || 'sb';

// Google Pay Merchant ID
export const GPAY_MERCHANT_ID = import.meta.env.REACT_APP_GPAY_MERCHANT_ID;

// Google Pay Environment: 'TEST|PRODUCTION'
export const GPAY_CLIENT_ENV =
  import.meta.env.REACT_APP_GPAY_ENV || 'PRODUCTION';

export const LONGVIEW_ROOT = 'https://longview.linode.com/fetch';

/** optional variables */
export const SENTRY_URL = import.meta.env.REACT_APP_SENTRY_URL;
export const LOGIN_SESSION_LIFETIME_MS = 45 * 60 * 1000;
export const OAUTH_TOKEN_REFRESH_TIMEOUT = LOGIN_SESSION_LIFETIME_MS / 2;
/** Adobe Analytics */
export const ADOBE_ANALYTICS_URL = import.meta.env
  .REACT_APP_ADOBE_ANALYTICS_URL;
export const NUM_ADOBE_SCRIPTS = 3;
/** for hard-coding token used for API Requests. Example: "Bearer 1234" */
export const ACCESS_TOKEN = import.meta.env.REACT_APP_ACCESS_TOKEN;

export const LOG_PERFORMANCE_METRICS =
  !isProductionBuild &&
  import.meta.env.REACT_APP_LOG_PERFORMANCE_METRICS === 'true';

export const DISABLE_EVENT_THROTTLE =
  Boolean(import.meta.env.REACT_APP_DISABLE_EVENT_THROTTLE) || false;

// read about luxon formats https://moment.github.io/luxon/docs/manual/formatting.html
// this format is not ISO
export const DATETIME_DISPLAY_FORMAT = 'yyyy-MM-dd HH:mm';
// ISO 8601 formats
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
export const ISO_DATETIME_NO_TZ_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

export const MAX_VOLUME_SIZE = 10240;

/**
 * As per the current support polocy
 * timeline for depricated distro is 6 months beyond eol date from image endpoints.
 * refere M3-5753 for more info.
 */
export const MAX_MONTHS_EOL_FILTER = 6;

/**
 * The lowest interval at which to make an Events request. This is later multiplied by the pollIteration
 * to get the actual interval.
 */
export const INTERVAL = 1000;

/**
 * Time after which data from the API is considered stale (half an hour)
 */
export const REFRESH_INTERVAL = 60 * 30 * 1000;

// Default error message for non-API errors
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

// Default size limit for Images (some users have custom limits)
export const IMAGE_DEFAULT_LIMIT = 6144;

export const allowedHTMLTagsStrict: string[] = [
  'a',
  'p',
  'b',
  'del',
  'em',
  'i',
  'code',
  'strong',
];

export const allowedHTMLTagsFlexible: string[] = [
  ...allowedHTMLTagsStrict,
  'abbr',
  'acronym',
  'blockquote',
  'br',
  'hr',
  'li',
  'ol',
  'ul',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
];

export const allowedHTMLAttr = ['href', 'lang', 'title', 'align'];

/**
 * MBps rate for intra DC migrations (AKA Mutations)
 */
export const MBpsIntraDC = 200;

/**
 * MBps rate for inter DC migrations (AKA Cross-Data-Center migrations )
 */
export const MBpsInterDC = 7.5;

/**
 * The incoming network rate (in Gbps) that is standard for all Linodes
 */
export const LINODE_NETWORK_IN = 40;

/**
 * Events that have entities or otherwise would
 * be calculated as "clickable" in menus, but for which
 * there is no sensible destination.
 */
export const nonClickEvents = ['profile_update'];

/**
 * Root URL for Object Storage clusters and buckets.
 * A bucket can be accessed at: {bucket}.{cluster}.OBJECT_STORAGE_ROOT
 */
export const OBJECT_STORAGE_ROOT = 'linodeobjects.com';

/**
 * This delimiter is used to retrieve objects at just one hierarchical level.
 * As an example, assume the following objects are in a bucket:
 *
 * file1.txt
 * my-folder/file2.txt
 * my-folder/file3.txt
 *
 * Retrieving an object-list with a delimiter of '/' will return `file1.txt`
 * only. This mechanism, in combination with "prefix" and "marker", allow us
 * to simulate folder traversal of a bucket.
 */
export const OBJECT_STORAGE_DELIMITER = '/';

// Value from  1-4 reflecting a minimum score from zxcvbn
export const MINIMUM_PASSWORD_STRENGTH = 4;

// When true, use the mock API defined in serverHandlers.ts instead of making network requests
export const MOCK_SERVICE_WORKER =
  import.meta.env.REACT_APP_MOCK_SERVICE_WORKER === 'true';

// Maximum payment methods
export const MAXIMUM_PAYMENT_METHODS = 6;

// Default payment limits of Braintree payments in USD ($)
export const PAYMENT_MIN = 5;
export const PAYMENT_SOFT_MAX = 2_000;
export const PAYMENT_HARD_MAX = 50_000;

export const DB_ROOT_USERNAME = 'linroot';

// "In an effort to fight spam, Linode restricts outbound connections on ports 25, 465, and 587 on all Linodes for new accounts created after November 5th, 2019."
// https://www.linode.com/docs/email/best-practices/running-a-mail-server/
export const MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED =
  '2022-11-30T00:00:00.000Z'; // Date of release for Manager v1.81.0.

// The date Linode switching to Akamai (for purposes of billing)
export const AKAMAI_DATE = '2022-12-15 00:00:00';

export const ADDRESSES = {
  akamai: {
    international: {
      address1: 'Grafenauweg 8',
      city: 'Zug',
      country: 'Switzerland',
      entity: 'Akamai Technologies International AG',
      state: 'Zug',
      zip: 'CH-6300',
    },
    us: {
      address1: '145 Broadway',
      city: 'Cambridge',
      country: 'USA',
      entity: 'Akamai Technologies, Inc.',
      state: 'MA',
      zip: '02142',
    },
  },
  linode: {
    address1: '249 Arch St.',
    city: 'Philadelphia',
    country: 'USA',
    entity: 'Linode',
    state: 'PA',
    zip: '19106',
  },
};

export const ACCESS_LEVELS = {
  none: 'none',
  readOnly: 'read_only',
  readWrite: 'read_write',
};

// Linode Community URL accessible from the TopMenu Community icon
export const LINODE_COMMUNITY_URL = 'https://linode.com/community';

export const FEEDBACK_LINK = 'https://www.linode.com/feedback/';

export const DEVELOPERS_LINK = 'https://developers.linode.com';

// URL validators
export const OFFSITE_URL_REGEX = /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
export const ONSITE_URL_REGEX = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;

// Firewall links
export const CREATE_FIREWALL_LINK =
  'https://www.linode.com/docs/products/networking/cloud-firewall/guides/create-a-cloud-firewall/';
export const FIREWALL_GET_STARTED_LINK =
  'https://www.linode.com/docs/products/networking/cloud-firewall/get-started/';
export const FIREWALL_LIMITS_CONSIDERATIONS_LINK =
  'https://www.linode.com/docs/products/networking/cloud-firewall/#limits-and-considerations';
