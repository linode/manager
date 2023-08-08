import { setupWorker } from 'msw';
import { SetupWorkerApi } from 'msw/lib/types/setupWorker/setupWorker';

import { ENABLE_DEV_TOOLS, isProductionBuild } from 'src/constants';
import { mockDataController } from 'src/dev-tools/mockDataController';

import { handlers, mockDataHandlers } from './serverHandlers';

let worker: SetupWorkerApi;

if (!isProductionBuild || ENABLE_DEV_TOOLS) {
  worker = setupWorker(...handlers);

  // Subscribe to changes from the mockDataController, which is updated by local dev tools.
  mockDataController.subscribe((mockData) => {
    const mockHandlers = Object.keys(mockData).map((thisKey) => {
      const handlerGenerator = mockDataHandlers[thisKey];
      return handlerGenerator(mockData[thisKey].quantity);
    });

    worker.resetHandlers(...mockHandlers);
  });
}

export { worker };
