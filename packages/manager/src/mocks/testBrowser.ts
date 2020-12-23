import { setupWorker } from 'msw';
import { SetupWorkerApi } from 'msw/lib/types/setupWorker/setupWorker';
import { isProductionBuild } from 'src/constants';
import { MockData, mockDataController } from 'src/dev-tools/mockDataController';
import store, { ApplicationState } from 'src/store';
import { requestDomains } from 'src/store/domains/domains.requests';
import { requestLinodes } from 'src/store/linodes/linode.requests';
import { getAllNodeBalancers } from 'src/store/nodeBalancer/nodeBalancer.requests';
import { getAllVolumes } from 'src/store/volume/volume.requests';
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
  // Addendum 12/23/20: The wiring here will change once we move to React Query,
  // we should handle this update at that time.
  if (mockData.linode && !reduxState.__resources.linodes.loading) {
    store.dispatch(requestLinodes({}) as any);
  }
  if (mockData.nodeBalancer && !reduxState.__resources.nodeBalancers.loading) {
    store.dispatch(getAllNodeBalancers() as any);
  }
  if (mockData.domain && !reduxState.__resources.domains.loading) {
    store.dispatch(requestDomains() as any);
  }
  if (mockData.volume && !reduxState.__resources.volumes.loading) {
    store.dispatch(getAllVolumes() as any);
  }
};

export { worker };
