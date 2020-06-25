import { captureException, configureScope, withScope } from '@sentry/browser';
import { SENTRY_URL } from 'src/constants';
import { initSentry } from 'src/initSentry';

initSentry();

const errorsToIgnore: string[] = [
  'Invalid OAuth Token',
  'Not Found',
  'You are not authorized',
  'safari-extension',
  'chrome-extension',
  // We know this is a problem. @todo: implement flow control in Lish.
  'write data discarded, use flow control to avoid losing data',
  // This is an error coming from the MUI Ripple effect.
  'TouchRipple'
];

// eslint-disable-next-line
window.addEventListener('unhandledrejection', event => {
  const _stack = event?.reason?.stack;
  // Enforce that `stack` is a string.
  const stack = typeof _stack === 'string' ? _stack : '';

  if (stack.match(/launchdarkly/i)) {
    /**
     * This doesn't affect error reporting, but avoids some console noise
     * until we've cleaned up Sentry.
     */
    return;
  }

  const _firstReason = event.reason?.[0]?.reason;
  // Enforce that `firstReason` is a string.
  const firstReason = typeof _firstReason === 'string' ? _firstReason : '';

  /*
    if our error is an error we want to ignore, don't report to Sentry

    Ideally we shouldn't be doing this because the goal app-wide should be to
    catch every and all promise, but because of time and resources that just isn't a
    possibility. For now, just ignore OAuth and "Not Found" errors and don't report them
    to Sentry
   */
  if (
    errorsToIgnore.some(eachString => {
      const regex = new RegExp(eachString, 'gmi');
      return !!firstReason.match(regex) || stack.match(regex);
    })
  ) {
    return;
  }

  /* otherwise report to sentry as normal */
  reportException(event.reason);
});

// Wrapper around Sentry's `captureException` function. A local scope is created
// so that we can add `extra` and `tags` to this specific Sentry event.
export const reportException = (
  error: string | Error,
  extra?: Record<string, any>,
  tags?: Record<string, string>
) => {
  // Don't report errors if the environment doesn't include a Sentry URL.
  if (!SENTRY_URL) {
    return;
  }

  // Log the error to the console in non-production environments.
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable */
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
    /* eslint-enable */
  }

  // Create a local scope so we can add `extra` and `tags` to this specific
  // Sentry event.
  withScope(scope => {
    if (extra) {
      Object.keys(extra).forEach(extraKey => {
        scope.setExtra(extraKey, extra[extraKey]);
      });
    }

    if (tags) {
      Object.keys(tags).forEach(tagKey => {
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
  configureScope(scope => {
    scope.setUser({
      user_id: userId,
      username
    });
  });
};
