import { setupWorker } from 'msw/browser';

import { handlers } from './serverHandlers';

import type { HttpHandler } from 'msw';

export const worker = (
  extraHandlers: HttpHandler[],
  baseHandlers: HttpHandler[]
) => {
  return setupWorker(...extraHandlers, ...baseHandlers);
};

const storybookWorker = setupWorker(...handlers);
