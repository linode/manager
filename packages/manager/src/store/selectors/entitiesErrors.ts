import { path } from 'ramda';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';

type State = ApplicationState['__resources'];

export interface ErrorObject {
  hasErrors: boolean;
  linodes: boolean;
  nodebalancers: boolean;
}

export const linodesErrorSelector = (state: State) => {
  const error = path(['read'], state.linodes.error);
  return Boolean(error && Array.isArray(error) && error.length > 0);
};
export const nodeBalsErrorSelector = (state: State) => false; //  Boolean(state.nodebalancers.error && state.nodebalancers.error.length > 0)

export default createSelector(
  linodesErrorSelector,
  nodeBalsErrorSelector,
  (linodes, nodebalancers) => ({
    linodes,
    nodebalancers,
    hasErrors: linodes || nodebalancers,
  })
);
