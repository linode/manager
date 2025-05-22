import { setupWorker } from 'msw/browser';

import type { HttpHandler } from 'msw';

export const worker = (
  extraHandlers: HttpHandler[],
  baseHandlers: HttpHandler[]
) => {
  return setupWorker(...extraHandlers, ...baseHandlers);
};
