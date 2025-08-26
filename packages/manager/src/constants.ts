import { getBooleanEnv } from '@linode/utilities';

// Whether or not this is a Vite production build
// This does not necessarily mean Cloud is running in a production environment.
// For example, cloud.dev.linode.com is technically a production build.
export const isProductionBuild = import.meta.env.PROD;

// allow us to explicity enable dev tools
export const ENABLE_DEV_TOOLS =
  import.meta.env.REACT_APP_ENABLE_DEV_TOOLS === undefined
    ? import.meta.env.DEV
    : getBooleanEnv(import.meta.env.REACT_APP_ENABLE_DEV_TOOLS);

// allow us to explicity enable maintenance mode
export const ENABLE_MAINTENANCE_MODE = getBooleanEnv(
  import.meta.env.REACT_APP_ENABLE_MAINTENANCE_MODE
);

/**
 * Because Cloud Manager uses two different search implementations depending on the account's
 * size, we have this environment variable which allows us to force Cloud Manager to use
 * a desired implementation.
 *
 * @example REACT_APP_FORCE_SEARCH_TYPE=api
 */
export const FORCE_SEARCH_TYPE = import.meta.env.REACT_APP_FORCE_SEARCH_TYPE;

export const API_ROOT =
  import.meta.env.REACT_APP_API_ROOT || 'https://api.linode.com/v4';

/**
 * A display name for the current environment.
 * This exists so we can dynamically set our Sentry environment.
 */
export const ENVIRONMENT_NAME =
  import.meta.env.REACT_APP_ENVIRONMENT_NAME ?? 'local';

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

/** Adobe Analytics */
export const ADOBE_ANALYTICS_URL = import.meta.env
  .REACT_APP_ADOBE_ANALYTICS_URL;

/** Pendo */
export const PENDO_API_KEY = import.meta.env.REACT_APP_PENDO_API_KEY;

/** for hard-coding token used for API Requests. Example: "Bearer 1234" */
export const ACCESS_TOKEN = import.meta.env.REACT_APP_ACCESS_TOKEN;

// read about luxon formats https://moment.github.io/luxon/docs/manual/formatting.html
// this format is not ISO
export const DATETIME_DISPLAY_FORMAT = 'yyyy-MM-dd HH:mm';
// ISO 8601 formats
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';
export const ISO_DATETIME_NO_TZ_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

export const MAX_VOLUME_SIZE = 16384;

/**
 * As per the current support polocy
 * timeline for depricated distro is 6 months beyond eol date from image endpoints.
 * refere M3-5753 for more info.
 */
export const MAX_MONTHS_EOL_FILTER = 6;

/**
 * Values used for our events polling system.
 * Number values are in milliseconds
 */
export const POLLING_INTERVALS = {
  /**
   * By default, we will poll for events every 16 seconds
   */
  DEFAULT: 16_000,
  /**
   * If there are "in-progress" events, we will poll every 2 seconds to give users
   * a real-time feeling experience
   *
   * The /v4/account/events endpoint has a rate-limit of 400 requets per minute.
   * If we request events every 2 seconds, we will make 30 calls in 1 minute.
   * We should be well within rate-limits.
   */
  IN_PROGRESS: 2_000,
} as const;

// Default error message for non-API errors
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

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

export const allowedHTMLAttr = [
  'href',
  'lang',
  'title',
  'align',
  'class',
  'rel',
];

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

// Maximum payment methods
export const MAXIMUM_PAYMENT_METHODS = 6;

// Default payment limits of Braintree payments in USD ($)
export const PAYMENT_MIN = 5;
export const PAYMENT_SOFT_MAX = 2_000;
export const PAYMENT_HARD_MAX = 50_000;

export const DB_ROOT_USERNAME = 'linroot';

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

// Linode Community URL accessible from the TopMenu Community icon
export const LINODE_COMMUNITY_URL = 'https://linode.com/community';

export const FEEDBACK_LINK = 'https://www.linode.com/feedback/';

export const DEVELOPERS_LINK = 'https://developers.linode.com';

// URL validators
export const OFFSITE_URL_REGEX =
  /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
export const ONSITE_URL_REGEX = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;

// Firewall links
export const FIREWALL_GET_STARTED_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-cloud-firewalls';
export const FIREWALL_LIMITS_CONSIDERATIONS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/cloud-firewall#limits-and-considerations';

/**
 * An array of region IDs.
 *
 * Currently, we don't have a region capability for Images.
 * We check for the Object Storage capability (because images use Object Stoarge on the backend)
 * but we need to exclude some regions manually because not every Object Stoage region support images.
 *
 * I made https://github.com/bnussman/image-compat-checker to try to help us identify which regions support images
 * and which regions do not.
 *
 * Long term, we will hopefully remove this constant if
 * - the API provides us a region capability for Images
 * - or all Object Storage regions support Images
 */
export const DISALLOWED_IMAGE_REGIONS = [
  'gb-lon',
  'au-mel',
  'sg-sin-2',
  'jp-tyo-3',
];

// Default tooltip text for actions without permission
export const NO_PERMISSION_TOOLTIP_TEXT =
  'You do not have permission to perform this action.';
