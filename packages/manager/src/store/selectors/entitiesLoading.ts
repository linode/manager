import { APIError } from '@linode/api-v4/lib/types';
import { createSelector } from 'reselect';

import { ApplicationState } from 'src/store';
import { RequestableDataWithEntityError } from 'src/store/types';

type State = ApplicationState['__resources'];

interface Resource<T, E = APIError[]> {
  entities: T;
  error?: E;
  lastUpdated: number;
  loading: boolean;
  results: number[] | string[];
}

const emptyResource = {
  entities: [],
  lastUpdated: 0,
  loading: false,
  results: [],
};

export const linodesSelector = (state: State) => state.linodes;
export const volumesSelector = (state: State) => emptyResource; // state.volumes
export const nodeBalsSelector = (state: State) => emptyResource; // state.nodebalancers

const isInitialLoad = (
  e: RequestableDataWithEntityError<any> | Resource<any, any>
) => e.loading && e.lastUpdated === 0;

export default createSelector(
  linodesSelector,
  volumesSelector,
  nodeBalsSelector,
  (linodes, volumes, nodebalancers) => {
    const entities = [linodes, volumes, nodebalancers];
    const l = entities.length;
    for (let i = 0; i < l; i++) {
      if (isInitialLoad(entities[i])) {
        return true;
      }
    }
    return false;
  }
);
