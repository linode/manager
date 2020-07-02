import { setupWorker } from 'msw';

import { MOCK_SERVICE_WORKER } from 'src/constants';
import { handlers } from './serverHandlers';

const finalHandlers = MOCK_SERVICE_WORKER ? handlers : [];

export const worker = setupWorker(...finalHandlers);

worker.start();
