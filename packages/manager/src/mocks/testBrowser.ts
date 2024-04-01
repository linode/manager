import { setupWorker } from 'msw/browser';

import { handlers } from './serverHandlers';

export const worker = setupWorker(...handlers);
