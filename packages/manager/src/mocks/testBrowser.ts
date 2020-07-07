import { setupWorker } from 'msw';

import { MOCK_SERVICE_WORKER } from 'src/constants';
import { handlers } from './serverHandlers';

/**
 * If the .env tells us to mock the API, load
 * the mocks.
 */
if (MOCK_SERVICE_WORKER) {
  const worker = setupWorker(...handlers);
  worker.start();
}
