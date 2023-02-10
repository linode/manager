import { ZoneName } from '@linode/api-v4/lib/networking';
import { ObjectStorageClusterID } from '@linode/api-v4/lib/object-storage';

const PRODUCTION = 'production';

// native to webpack build
export const isProductionBuild = process.env.NODE_ENV === PRODUCTION;

// allow us to explicity enable dev tools
export const ENABLE_DEV_TOOLS = Boolean(process.env.REACT_APP_ENABLE_DEV_TOOLS);

/** required for the app to function */
export const APP_ROOT =
  process.env.REACT_APP_APP_ROOT || 'http://localhost:3000';
export const LOGIN_ROOT =
  process.env.REACT_APP_LOGIN_ROOT || 'https://login.linode.com';
export const API_ROOT =
  process.env.REACT_APP_API_ROOT || 'https://api.linode.com/v4';
export const BETA_API_ROOT = API_ROOT + 'beta';
export const LISH_ROOT =
  process.env.REACT_APP_LISH_ROOT || 'webconsole.linode.com';
/** generate a client_id by navigating to https://cloud.linode.com/profile/clients */
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
/** All of the following used specifically for Algolia search */
export const DOCS_BASE_URL = 'https://linode.com';
export const COMMUNITY_BASE_URL = 'https://linode.com/community/';
export const DOCS_SEARCH_URL =
  'https://www.linode.com/docs/topresults/?docType=products%2Cguides%2Capi%2Creference-architecture&lndq=';
export const COMMUNITY_SEARCH_URL =
  'https://linode.com/community/questions/search?query=';
export const ALGOLIA_APPLICATION_ID =
  process.env.REACT_APP_ALGOLIA_APPLICATION_ID || '';
export const ALGOLIA_SEARCH_KEY =
  process.env.REACT_APP_ALGOLIA_SEARCH_KEY || '';
export const LAUNCH_DARKLY_API_KEY =
  process.env.REACT_APP_LAUNCH_DARKLY_ID || '';
export const LINODE_STATUS_PAGE_URL =
  process.env.REACT_APP_STATUS_PAGE_URL || 'https://status.linode.com/api/v2';

// Maximum page size allowed by the API. Used in the `getAll()` helper function
// to request as many items at once as possible.
export const API_MAX_PAGE_SIZE =
  Number(process.env.REACT_APP_API_MAX_PAGE_SIZE) || 500;

// Having more of a single entity than this number classifies you as having
// a "large account".
export const LARGE_ACCOUNT_THRESHOLD = 1500;

// PayPal Client ID
export const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'sb';

// Sets Paypal Environment, valid values: 'sandbox|production'
// @todo lets depreate this with the PayPal + Braintree work
export const PAYPAL_CLIENT_ENV =
  process.env.REACT_APP_PAYPAL_ENV || 'production';

// Google Pay Merchant ID
export const GPAY_MERCHANT_ID = process.env.REACT_APP_GPAY_MERCHANT_ID;

// Google Pay Environment: 'TEST|PRODUCTION'
export const GPAY_CLIENT_ENV = process.env.REACT_APP_GPAY_ENV || 'PRODUCTION';

export const LONGVIEW_ROOT = 'https://longview.linode.com/fetch';

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
  !isProductionBuild &&
  process.env.REACT_APP_LOG_PERFORMANCE_METRICS === 'true';

export const DISABLE_EVENT_THROTTLE =
  Boolean(process.env.REACT_APP_DISABLE_EVENT_THROTTLE) || false;

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

/**
 * Used by e.g. LISH to determine the websocket connection address.
 * Whenever updating this, also update the corresponding name in resolvers.ts
 */
export const ZONES: Record<string, ZoneName> = {
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
  'ap-west': 'mumbai1',
  'ap-southeast': 'sydney1',
  'us-iad': 'washington3',
};

export const dcDisplayNames = {
  // us-east-1 is for backwards-compatibility
  'us-east-1': 'Newark, NJ',
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
  'ap-west': 'Mumbai, IN',
  'ap-southeast': 'Sydney, AU',
  'us-iad': 'Washington, DC',
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
  'ap-west': 'IN',
  'ap-southeast': 'AU',
  'us-iad': 'US',
};

// Map OBJ Cluster IDs to their display country.
export const objectStorageClusterDisplay: Record<
  ObjectStorageClusterID,
  string
> = {
  'us-east-1': 'Newark, NJ',
  'eu-central-1': 'Frankfurt, DE',
  'ap-south-1': 'Singapore, SG',
  'us-southeast-1': 'Atlanta, GA',
};

// Default error message for non-API errors
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

// Default size limit for Images (some users have custom limits)
export const IMAGE_DEFAULT_LIMIT = 6144;

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
  'tr',
];

export const allowedHTMLAttr = ['href', 'lang', 'title', 'align'];

/**
 * MBps rate for intra DC migrations (AKA Mutations)
 */
export const MBpsIntraDC = 200;

/**
 * MBps rate for inter DC migrations (AKA Cross-Datacenter migrations )
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
export const MINIMUM_PASSWORD_STRENGTH = 2;

// When true, use the mock API defined in serverHandlers.ts instead of making network requests
export const MOCK_SERVICE_WORKER =
  process.env.REACT_APP_MOCK_SERVICE_WORKER === 'true';

// Maximum payment methods
export const MAXIMUM_PAYMENT_METHODS = 6;

// Default payment limits of Braintree payments in USD ($)
export const PAYMENT_MIN = 5;
export const PAYMENT_SOFT_MAX = 2_000;
export const PAYMENT_HARD_MAX = 50_000;

// Price of LKE's High Availability offering in USD
export const HIGH_AVAILABILITY_PRICE =
  process.env.REACT_APP_LKE_HIGH_AVAILABILITY_PRICE === undefined
    ? undefined
    : Number(process.env.REACT_APP_LKE_HIGH_AVAILABILITY_PRICE);

export const DB_ROOT_USERNAME = 'linroot';

// "In an effort to fight spam, Linode restricts outbound connections on ports 25, 465, and 587 on all Linodes for new accounts created after November 5th, 2019."
// https://www.linode.com/docs/email/best-practices/running-a-mail-server/
export const MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED =
  '2022-11-30T00:00:00.000Z'; // Date of release for Manager v1.81.0.

// The date Linode switching to Akamai (for purposes of billing)
export const AKAMAI_DATE = '2022-12-15 00:00:00';

export const ADDRESSES = {
  linode: {
    entity: 'Linode',
    address1: '249 Arch St.',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19106',
    country: 'USA',
  },
  akamai: {
    us: {
      entity: 'Akamai Technologies, Inc.',
      address1: '145 Broadway',
      city: 'Cambridge',
      state: 'MA',
      zip: '02142',
      country: 'USA',
    },
    international: {
      entity: 'Akamai Technologies International AG',
      address1: 'Grafenauweg 8',
      city: 'Zug',
      state: 'Zug',
      zip: 'CH-6300',
      country: 'Switzerland',
    },
  },
};

export const BRAND_UDPATE = true;
