import { path } from 'ramda';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

type State = ApplicationState['__resources'];

export interface ErrorObject {
  hasErrors: boolean;
  linodes: boolean;
  volumes: boolean;
  nodebalancers: boolean;
  kubernetes: boolean;
}

export const linodesErrorSelector = (state: State) => {
  const error = path(['read'], state.linodes.error);
  return Boolean(error && Array.isArray(error) && error.length > 0);
};
export const volumesErrorSelector = (state: State) => false; //  Boolean(state.volumes.error && state.volumes.error.length > 0)
export const nodeBalsErrorSelector = (state: State) => false; //  Boolean(state.nodebalancers.error && state.nodebalancers.error.length > 0)
export const typesErrorSelector = (state: State) =>
  Boolean(state.types.error && state.types.error.length > 0);
export const kubernetesErrorSelector = (state: State) =>
  Object.values(state.kubernetes.error ?? {}).some(Boolean);

export default createSelector<
  State,
  boolean,
  boolean,
  boolean,
  boolean,
  ErrorObject
>(
  linodesErrorSelector,
  volumesErrorSelector,
  nodeBalsErrorSelector,
  kubernetesErrorSelector,
  (linodes, volumes, nodebalancers, kubernetes) => ({
    linodes,
    volumes,
    nodebalancers,
    kubernetes,
    hasErrors: linodes || volumes || nodebalancers || kubernetes,
  })
);
