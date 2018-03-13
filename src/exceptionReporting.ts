import * as Raven from 'raven-js';
import { SENTRY_URL } from 'src/constants';

window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  Raven.captureException(err.reason);
});

if (SENTRY_URL) {
  Raven
    .config(SENTRY_URL)
    .install();
}
