import { captureException, configureScope } from '@sentry/browser';
import { pathOr } from 'ramda';
import { SENTRY_URL } from 'src/constants';

import store from 'src/store';

import { initSentry } from 'src/initSentry';

initSentry();

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
