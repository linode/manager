import * as Raven from 'raven-js';
import { SENTRY_URL } from 'src/constants';

if (SENTRY_URL) {
  Raven
    .config(SENTRY_URL)
    .install();
}
