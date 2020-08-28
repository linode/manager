import { setupWorker } from 'msw';
import { MOCK_SERVICE_WORKER } from 'src/constants';
import { MockData, mockDataController } from 'src/dev-tools/mockDataController';
import store, { ApplicationState } from 'src/store';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { handlers, mockDataHandlers } from './serverHandlers';

/**
 * If the .env tells us to mock the API, load
 * the mocks.
 */
if (MOCK_SERVICE_WORKER) {
  const worker = setupWorker(...handlers);
  // worker.start();

  // Subscribe to changes from the mockDataController, which is updated by local dev tools.
  mockDataController.subscribe(mockData => {
    const mockHandlers = Object.keys(mockData).map(thisKey => {
      const handlerGenerator = mockDataHandlers[thisKey];
      return handlerGenerator(mockData[thisKey].quantity);
    });

    worker.resetHandlers(...mockHandlers);

    // Now that the service workers have been reset, we need to re-request entities to update them.
    requestEntities(mockData, store.getState());
  });
}

const requestEntities = (mockData: MockData, reduxState: ApplicationState) => {
  // In the future this could be dynamic (Linodes, Domains, etc.)
  if (mockData.linode && !reduxState.__resources.linodes.loading) {
    store.dispatch(requestLinodes({}) as any);
  }
};
