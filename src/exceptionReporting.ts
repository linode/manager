import {
  BrowserOptions,
  captureException,
  configureScope,
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
    whitelistUrls: [
      /** anything from either *.linode.com/* or localhost:3000 */
      /linode.com{1}/g,
      /localhost:3000{1}/g
    ]
  });
}

window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  captureException(err.reason);
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
