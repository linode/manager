import { BrowserOptions, captureException, init } from '@sentry/browser';
import { lensPath, over } from 'ramda';
import { SENTRY_URL } from 'src/constants';
import redactAccessTokenFromUrl from 'src/utilities/redactAccessTokenFromUrl';

const updateRequestUrl = over(
  lensPath(['request', 'url']),
  redactAccessTokenFromUrl
);

const beforeSend: BrowserOptions['beforeSend'] = (event, hint) => {
  return updateRequestUrl(event);
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
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
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
    blacklistUrls: [
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i
    ],
    whitelistUrls: [
      /** anything from either *.linode.com or linode.com */
      /https?:\/\/((cdn|www)\.)?linode\.com/
    ]
  });
}

window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  captureException(err.reason);
});

export const reportException = (error: string | Error, extra?: any) => {
  if (process.env.NODE_ENV === 'production' && SENTRY_URL) {
    captureException(error);
  } else {
    /* tslint:disable */
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
  }
};
