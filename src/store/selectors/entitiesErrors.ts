import { path } from 'ramda';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

type State = ApplicationState['__resources'];

export interface ErrorObject {
  hasErrors: boolean;
  linodes: boolean;
  volumes: boolean;
  domains: boolean;
  images: boolean;
  nodebalancers: boolean;
}

export const linodesErrorSelector = (state: State) => {
  const error = path(['read'], state.linodes.error);
  return Boolean(error && Array.isArray(error) && error.length > 0);
};
export const volumesErrorSelector = (state: State) => false; //  Boolean(state.volumes.error && state.volumes.error.length > 0)
export const nodeBalsErrorSelector = (state: State) => false; //  Boolean(state.nodebalancers.error && state.nodebalancers.error.length > 0)
export const domainsErrorSelector = (state: State) =>
  Object.keys(state.domains.error).length > 0;
export const imagesErrorSelector = (state: State) =>
  Boolean(state.images.error && state.images.error.length > 0);
export const typesErrorSelector = (state: State) =>
  Boolean(state.types.error && state.types.error.length > 0);

export default createSelector<
  State,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  ErrorObject
>(
  linodesErrorSelector,
  volumesErrorSelector,
  nodeBalsErrorSelector,
  domainsErrorSelector,
  imagesErrorSelector,
  (linodes, volumes, nodebalancers, domains, images) => ({
    linodes,
    volumes,
    nodebalancers,
    domains,
    images,
    hasErrors: linodes || volumes || nodebalancers || domains || images
  })
);
