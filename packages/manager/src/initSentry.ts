import { BrowserOptions, Event as SentryEvent, init } from '@sentry/browser';
import { lensPath, over } from 'ramda';
import { SENTRY_URL } from 'src/constants';
import redactAccessTokenFromUrl from 'src/utilities/redactAccessTokenFromUrl';

const updateRequestUrl = over(
  lensPath(['request', 'url']),
  redactAccessTokenFromUrl
);

const beforeSend: BrowserOptions['beforeSend'] = (event, hint) => {
  /** remove the user's access token from the URL if one exists */
  const eventWithoutSensitiveInfo = updateRequestUrl(event);
  /** maybe add a custom fingerprint if this error is relevant */
  const eventWithCustomFingerprint = maybeAddCustomFingerprint(
    eventWithoutSensitiveInfo
  );
  return eventWithCustomFingerprint;
};

export const initSentry = () => {
  if (SENTRY_URL) {
    init({
      dsn: SENTRY_URL,
      release: process.env.VERSION,
      environment: process.env.NODE_ENV,
      beforeSend,
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
        'jigsaw is not defined',
        'ComboSearch is not defined',
        'http://loading.retry.widdit.com/',
        /** noisy error that appeared to be happening for logged out users? */
        "mousedownt' of undefined",
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
        'conduitPage'
      ],
      whitelistUrls: [
        /** anything from either *.linode.com/* or localhost:3000 */
        /linode.com{1}/g,
        /localhost:3000{1}/g
      ]
    });
  }
};

const maybeAddCustomFingerprint = (event: SentryEvent): SentryEvent => {
  const fingerprint = Object.keys(customFingerPrintMap).reduce((acc, value) => {
    /** if our sentry error matches one of the keys in the map */
    const exception = event.exception;
    if (exception && !!exception.values && exception.values.length > 0)
      if (
        !!exception.values[0].value &&
        !!exception.values[0].value.match(new RegExp(value, 'gmi'))
      ) {
        acc = customFingerPrintMap[value];
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
  return !!fingerprint
    ? {
        ...event,
        fingerprint: [fingerprint]
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
  quotaExceeded: 'Local Storage Error'
};
