import { captureException, configureScope } from '@sentry/browser';
import { pathOr } from 'ramda';
import { SENTRY_URL } from 'src/constants';

import store from 'src/store';

import { initSentry } from 'src/initSentry';

initSentry();

const promiseRejectionsToIgnore: string[] = [
  'Invalid OAuth Token',
  'Not Found'
];

window.addEventListener('unhandledrejection', err => {
  const firstReason = pathOr('', [0, 'reason'], err.reason);

  /* 
    if our error is an error we want to ignore, don't report to Sentry 
    
    Ideally we shouldn't be doing this because the goal app-wide should be to
    catch every and all promise, but because of time and resources that just isn't a
    possibility. For now, just ignore OAuth and "Not Found" errors and don't report them
    to Sentry
   */
  if (
    promiseRejectionsToIgnore.some(
      eachString => !!firstReason.match(new RegExp(eachString, 'gmi'))
    )
  ) {
    return;
  }

  /* otherwise report to sentry as normal */
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
