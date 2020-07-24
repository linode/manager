import { setupWorker } from 'msw';
import { equals } from 'ramda';
import store from 'src/store';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { handlers, mockDataHandlers } from './serverHandlers';
import { MOCK_SERVICE_WORKER } from 'src/constants';

/**
 * If the .env tells us to mock the API, load
 * the mocks.
 */
if (MOCK_SERVICE_WORKER) {
  const worker = setupWorker(...handlers);
  worker.start();

  let oldMockData: any;

  store.subscribe(() => {
    const mockData = Object.entries(store.getState().mockData);
    // Need to find a better way to ONLY listen for mockData store changes.
    if (mockData.length === 0 || equals(oldMockData, mockData)) {
      return;
    }

    oldMockData = mockData;

    // Create handlers based on mocked entities and their count.
    const mockHandlers = mockData.map(([key, value]) => {
      const handlerGenerator = mockDataHandlers[key];
      return handlerGenerator(value);
    });

    // @todo: make this dynamic when more entity types are added.
    if (
      store.getState().mockData.linode &&
      !store.getState().__resources.linodes.loading
    ) {
      store.dispatch(requestLinodes({}) as any);
    }

    // Reset the worker with the new handlers. @todo: find a way to combine handlers.
    worker.resetHandlers(...mockHandlers);
  });
}
