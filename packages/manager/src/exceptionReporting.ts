import { captureException, getCurrentScope, withScope } from '@sentry/react';

import { SENTRY_URL } from 'src/constants';
import { initSentry } from 'src/initSentry';

initSentry();

// Wrapper around Sentry's `captureException` function. A local scope is created
// so that we can add `extra` and `tags` to this specific Sentry event.
export const reportException = (
  error: Error | string,
  extra?: Record<string, any>,
  tags?: Record<string, string>
) => {
  // Don't report errors if the environment doesn't include a Sentry URL.
  if (!SENTRY_URL) {
    return;
  }

  // Log the error to the console in non-production environments.
  if (import.meta.env.DEV) {
    /* eslint-disable */
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
    /* eslint-enable */
  }

  // Create a local scope so we can add `extra` and `tags` to this specific
  // Sentry event.
  withScope((scope) => {
    if (extra) {
      Object.keys(extra).forEach((extraKey) => {
        scope.setExtra(extraKey, extra[extraKey]);
      });
    }

    if (tags) {
      Object.keys(tags).forEach((tagKey) => {
        scope.setTag(tagKey, tags[tagKey]);
      });
    }

    // `captureException` expects an Error object. If the `error` argument has
    // been given as a string, convert it to an Error object before capturing.
    if (typeof error === 'string') {
      captureException(Error(error));
    } else {
      captureException(error);
    }
  });
};

// Configure global scope to include user information. This function should be
// called once, as soon as user data is available.
export const configureErrorReportingUser = (
  userId: string,
  username: string
) => {
  getCurrentScope().setUser({
    user_id: userId,
    username,
  });
};
