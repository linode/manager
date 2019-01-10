import { createSelector } from 'reselect';

type State = ApplicationState['__resources'];

export const linodesSelector = (state: State) => state.linodes
export const volumesSelector = (state: State) => ({loading: false, lastUpdated: 0}) // state.volumes.loading
export const nodeBalsSelector = (state: State) => ({loading: false, lastUpdated: 0}) // state.nodebalancers.loading
export const domainsSelector = (state: State) => state.domains
export const imagesSelector = (state: State) => state.images
export const typesSelector = (state: State) => state.types

const isInitialLoad = (e: RequestableData<any>) => e.loading && e.lastUpdated === 0;

export default createSelector
  <State,
  RequestableData<Linode.Linode[]>,
  RequestableData<Linode.Volume[]>,
  RequestableData<Linode.NodeBalancer[][]>,
  RequestableData<Linode.Domain[]>,
  RequestableData<Linode.Image[]>,
  RequestableData<Linode.LinodeType[]>,
  boolean>
  (
    linodesSelector, volumesSelector, nodeBalsSelector, domainsSelector, imagesSelector, typesSelector,
    (linodes, volumes, nodebalancers, domains, images, types) => {
      const entities = [linodes, volumes, nodebalancers, domains, images, types];
      const l = entities.length;
      for (let i = 0; i < l; i++) {
        if (isInitialLoad(entities[l])) { return true; }
      }
      return false;
    }
)