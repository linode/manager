import {
  BrowserOptions,
  captureException,
  configureScope,
  Event as SentryEvent,
  init
} from '@sentry/browser';
import { lensPath, over, pathOr } from 'ramda';
import { SENTRY_URL } from 'src/constants';
import redactAccessTokenFromUrl from 'src/utilities/redactAccessTokenFromUrl';

import store from 'src/store';

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

window.addEventListener('unhandledrejection', err => {
  reportException(err.reason);
});

window.addEventListener('error', err => {
  reportException(err.message);
});

export const reportException = (
  error: string | Error,
  extra?: Record<string, any>,
  tags?: Record<string, string>
) => {
  /**
   * if we're in the development environment, log the error to the console
   */
  if (process.env.NODE_ENV !== 'production' && SENTRY_URL) {
    /* tslint:disable */
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
  }

  /** log the error to sentry as long as the URL exists in the .env */
  if (SENTRY_URL) {
    const userEmail = pathOr(
      'Could not get user email',
      ['__resources', 'profile', 'data', 'email'],
      store.getState()
    );
    const userID = pathOr(
      'Could not get user ID',
      ['__resources', 'profile', 'data', 'uid'],
      store.getState()
    );
    const username = pathOr(
      'Could not get username',
      ['__resources', 'profile', 'data', 'username'],
      store.getState()
    );

    configureScope(scopes => {
      if (extra) {
        Object.keys(extra).forEach(extraKey => {
          scopes.setExtra(extraKey, extra[extraKey]);
        });
      }

      if (tags) {
        Object.keys(tags).forEach(tagKey => {
          scopes.setTag(tagKey, tags[tagKey]);
        });
      }

      scopes.setUser({
        user_id: userID,
        email: userEmail,
        username
      });
    });

    captureException(error);
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
