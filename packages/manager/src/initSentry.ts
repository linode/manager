import { BrowserOptions, init } from '@sentry/react';

import { APP_ROOT, SENTRY_URL } from 'src/constants';

import packageJson from '../package.json';
import { redactAccessToken } from './utilities/redactAccessToken';
import { deepStringTransform } from './utilities/deepStringTransform';

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
      autoSessionTracking: false,
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

const beforeSend: BrowserOptions['beforeSend'] = (sentryError, hint) => {
  return deepStringTransform(sentryError, redactAccessToken);
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
