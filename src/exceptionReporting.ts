import * as Raven from 'raven-js';
import { SENTRY_URL } from 'src/constants';

window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  Raven.captureException(err.reason);
});

if (SENTRY_URL) {
  Raven
    .config(SENTRY_URL, {
      release: process.env.VERSION,
    })
    .install();
}

export const reportException = (error: string | Error, extra?: any) => {
  if (process.env.NODE_ENV === 'production' && SENTRY_URL) {
    Raven.captureException(error, { extra })
  } else {
    console.error('====================================');
    console.error(error);
    console.log(extra);
    console.error('====================================');
  }
};
