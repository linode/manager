import { setupWorker } from 'msw';
import { SetupWorkerApi } from 'msw/lib/types/setupWorker/setupWorker';
import { isProductionBuild } from 'src/constants';
import { MockData, mockDataController } from 'src/dev-tools/mockDataController';
import store, { ApplicationState } from 'src/store';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { getAllNodeBalancers } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { handlers, mockDataHandlers } from './serverHandlers';

let worker: SetupWorkerApi;

if (!isProductionBuild) {
  worker = setupWorker(...handlers);

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
  if (mockData.nodeBalancer && !reduxState.__resources.nodeBalancers.loading) {
    store.dispatch(getAllNodeBalancers() as any);
  }
};

export { worker };
