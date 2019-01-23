import { BrowserOptions, captureException, init } from '@sentry/browser';
import { lensPath, over } from 'ramda';
import { SENTRY_URL } from 'src/constants';
import redactAccessTokenFromUrl from 'src/utilities/redactAccessTokenFromUrl';

const updateRequestUrl = over(lensPath(['request', 'url']), redactAccessTokenFromUrl);

const beforeSend: BrowserOptions['beforeSend'] = (event, hint) => {
  return updateRequestUrl(event);
};

if (SENTRY_URL) {

  init({
    dsn: SENTRY_URL,
    release: process.env.VERSION,
    environment: process.env.NODE_ENV,
    beforeSend,
  });
}


window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  captureException(err.reason);
});

export const reportException = (error: string | Error, extra?: any) => {
  if (process.env.NODE_ENV === 'production' && SENTRY_URL) {
    captureException(error)
  } else {
    /* tslint:disable */
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
  }
};
