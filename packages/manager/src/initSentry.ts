import { deepStringTransform, redactAccessToken } from '@linode/utilities';
import { init } from '@sentry/react';

import { APP_ROOT, SENTRY_URL } from 'src/constants';

import packageJson from '../package.json';

import type { APIError } from '@linode/api-v4';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';

export const initSentry = () => {
  const environment = getSentryEnvironment();

  if (SENTRY_URL) {
    init({
      allowUrls: [
        /**
         * anything from either *linode.com* or *localhost:3000*
         */
        'linode.com',
        'localhost:3000',
      ],
      beforeSend,
      denyUrls: [
        // New Relic script
        /new-relic\.js/i,
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
      ],
      dsn: SENTRY_URL,
      environment,
      ignoreErrors: [
        // Random plugins/extensions
        'top.GLOBALS',
        'MetaMask detected another web3',
        // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'http://tt.epicplay.com',
        "Can't find variable: ZiteReader",
        'LaunchDarklyFlagFetchError',
        'jigsaw is not defined',
        'ComboSearch is not defined',
        'http://loading.retry.widdit.com/',
        /** noisy error that appeared to be happening for logged out users? */
        "mousedown' of undefined",
        /**
         * see https://github.com/getsentry/sentry-javascript/issues/2074
         * for this noisy issue
         */
        'convert undefined or null to object',
        'atomicFindClose',
        'Cannot redefine property: play',
        /** material-ui errors */
        'e.touches is undefined',
        "Object doesn't support property or method 'closest'",
        'target.className.indexOf is not a function',
        "can't access dead object",
        /** paypal errors */
        'No ack for postMessage getName()',
        '/graphql returned status 401',
        'https://www.paypal.com/xoplatform/logger/api/logger',
        // Facebook borked
        'fb_xd_fragment',
        // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
        // reduce this. (thanks @acdha)
        // See http://stackoverflow.com/questions/4113268
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
        'conduitPage',
        // Don't report client network errors.
        'ChunkLoadError',
        'Network Error',
        // This is apparently a benign error: https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
        'ResizeObserver loop limit exceeded',
      ],
      release: packageJson.version,
      /**
       * Uncomment the 3 lines below to enable Sentry's "Performance" feature.
       * We're disabling it October 2nd 2023 because we are running into plan limits
       * and this Sentry feature isn't crucial to our workflow.
       */
      // enableTracing: true,
      // integrations: [new BrowserTracing()],
      // tracesSampleRate: environment === 'production' ? 0.025 : 1,
    });
  }
};

const beforeSend = (sentryEvent: SentryErrorEvent): null | SentryErrorEvent => {
  const normalizedErrorMessage = normalizeErrorMessage(sentryEvent.message);

  if (
    errorsToIgnore.some((eachRegex) =>
      Boolean(normalizedErrorMessage?.match(eachRegex))
    )
  ) {
    return null;
  }

  sentryEvent.message = normalizedErrorMessage;

  /** remove the user's access token from the event if one exists */
  const eventWithoutSensitiveInfo = deepStringTransform(
    sentryEvent,
    redactAccessToken
  );

  /** maybe add a custom fingerprint if this error is relevant */
  return maybeAddCustomFingerprint(eventWithoutSensitiveInfo);
};

export const errorsToIgnore: RegExp[] = [
  /Invalid (OAuth )?Token/gi,
  /Not Found/gi,
  /You are not authorized/gi,
  /Unauthorized/gi,
  /This Linode has been suspended/gi,
  /safari-extension/gi,
  /chrome-extension/gi,
  // We know this is a problem. @todo: implement flow control in Lish.
  /write data discarded, use flow control to avoid losing data/gi,
  // This is an error coming from the MUI Ripple effect.
  /TouchRipple/gi,
  // The theory is that these come from network interruptions.
  /Unexpected end of input/gi,
  /Unexpected end of script/gi,
  // Local storage errors:
  /Failed to read the 'localStorage' property from 'Window'/gi,
  /Cannot read property 'getItem' of null/gi,
  /NS_ERROR_FILE_CORRUPTED/gi,
];

// We can't trust the type of the "message" on a Sentry event, since it may
// actually be something like a (Linode) API Error instead of a string. We need
// to ensure we're  dealing with strings so we can determine if we should ignore
// the error, or appropriately report the message to Sentry (i.e. not "<unknown>").
type ErrorMessage = (() => void) | [APIError] | object | string | undefined;
export const normalizeErrorMessage = (
  sentryErrorMessage: ErrorMessage
): string => {
  if (typeof sentryErrorMessage === 'string') {
    return sentryErrorMessage;
  }

  if (
    Array.isArray(sentryErrorMessage) &&
    sentryErrorMessage!.length === 1 &&
    sentryErrorMessage[0]?.reason
  ) {
    return sentryErrorMessage[0].reason;
  }

  if (['function', 'undefined'].includes(typeof sentryErrorMessage)) {
    return 'Unknown error';
  }

  return JSON.stringify(sentryErrorMessage);
};

const maybeAddCustomFingerprint = (
  event: SentryErrorEvent
): SentryErrorEvent => {
  const fingerprint = Object.keys(customFingerPrintMap).reduce((acc, value) => {
    /** if our sentry error matches one of the keys in the map */
    const exception = event.exception;
    if (
      exception &&
      exception.values &&
      exception.values.length > 0 &&
      !!exception.values[0].value &&
      !!exception.values[0].value.match(new RegExp(value, 'gmi'))
    ) {
      acc = customFingerPrintMap[value as keyof typeof customFingerPrintMap];
    }
    return acc;
  }, '');

  /**
   * fingerprint will be an empty string if the error didn't match one
   * of the keys from our map
   *
   * add the fingerprint to the Sentry error so same events get
   * grouped together in the Sentry dashboard.
   */
  return fingerprint
    ? {
        ...event,
        fingerprint: [fingerprint],
      }
    : event;
};

/**
 * this is the map that will help us determine if the
 * sentry error should be given a custom fingerprint.
 *
 * The way this works is that you compare the Sentry error
 * message to all the keys in this object and if it finds a match,
 * use the value of the match as the custom fingerprint.
 *
 * Read more about Sentry fingerprints here:
 *
 * https://blog.sentry.io/2018/01/18/setting-up-custom-fingerprints
 * https://docs.sentry.io/data-management/rollups/?platform=javascript#grouping-priorities
 */
const customFingerPrintMap = {
  /** group all local storage errors together */
  localstorage: 'Local Storage Error',
  quotaExceeded: 'Local Storage Error',
};

/**
 * Derives a environment name from the APP_ROOT environment variable
 * so a Sentry issue is identified by the correct environment name.
 */
const getSentryEnvironment = () => {
  if (APP_ROOT === 'https://cloud.linode.com') {
    return 'production';
  }
  if (APP_ROOT.includes('staging')) {
    return 'staging';
  }
  if (APP_ROOT.includes('dev')) {
    return 'dev';
  }
  return 'local';
};
