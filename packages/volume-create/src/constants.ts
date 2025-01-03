// whether or not this is a Vite production build
// This does not necessarily mean Cloud is running in a production environment.
// For example, cloud.dev.linode.com is technically a production build.

// allow us to explicity enable dev tools

// allow us to explicity enable maintenance mode

// Maximum page size allowed by the API. Used in the `getAll()` helper function
// to request as many items at once as possible.
export const API_MAX_PAGE_SIZE =
  Number(import.meta.env.REACT_APP_API_MAX_PAGE_SIZE) || 500;

// Having more of a single entity than this number classifies you as having
// a "large account".

// PayPal Client ID

// Google Pay Merchant ID

// Google Pay Environment: 'TEST|PRODUCTION'

// read about luxon formats https://moment.github.io/luxon/docs/manual/formatting.html
// this format is not ISO
// ISO 8601 formats

export const MAX_VOLUME_SIZE = 16384;

// Default error message for non-API errors
export const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred.";

// Default size limit for Images (some users have custom limits)

// Value from  1-4 reflecting a minimum score from zxcvbn

// When true, use the mock API defined in serverHandlers.ts instead of making network requests

// Maximum payment methods

// Default payment limits of Braintree payments in USD ($)

// The date Linode switching to Akamai (for purposes of billing)

// Linode Community URL accessible from the TopMenu Community icon

// URL validators

// Firewall links

// A/B Testing LD metrics keys for DX Tools
