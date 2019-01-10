import { createSelector } from 'reselect';

type State = ApplicationState['__resources'];

export const linodesLoadingSelector = (state: State) => state.linodes.loading
export const volumesLoadingSelector = (state: State) => false // state.volumes.loading
export const nodeBalsLoadingSelector = (state: State) => false // state.nodebalancers.loading
export const domainsLoadingSelector = (state: State) => state.domains.loading
export const imagesLoadingSelector = (state: State) => state.images.loading
export const typesLoadingSelector = (state: State) => state.types.loading

export default createSelector<State, boolean, boolean, boolean, boolean, boolean, boolean, boolean>(
  linodesLoadingSelector, volumesLoadingSelector, nodeBalsLoadingSelector, domainsLoadingSelector, imagesLoadingSelector, typesLoadingSelector,
  (linodes, volumes, nodebalancers, domains, images, types) =>
    (linodes || volumes || nodebalancers || domains || images || types)
)