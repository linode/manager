import { setupWorker } from 'msw';

import { handlers } from './serverHandlers';

export const worker = setupWorker(...handlers);
