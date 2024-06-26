import { setupWorker } from 'msw/browser';

import { handlers } from './serverHandlers';

import type { HttpHandler } from 'msw';

export const worker = (customHandlers?: HttpHandler[]) =>
  setupWorker(...(customHandlers ?? handlers));
