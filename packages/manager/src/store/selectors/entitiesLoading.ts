import { Linode, LinodeType } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import {
  EntityError,
  MappedEntityState2 as MappedEntityState,
  RequestableDataWithEntityError,
} from 'src/store/types';

import { State as ImageState } from 'src/store/image/image.reducer';

type State = ApplicationState['__resources'];

interface Resource<T, E = APIError[]> {
  results: string[] | number[];
  entities: T;
  loading: boolean;
  lastUpdated: number;
  error?: E;
}

const emptyResource = {
  results: [],
  entities: [],
  loading: false,
  lastUpdated: 0,
};

export const linodesSelector = (state: State) => state.linodes;
export const volumesSelector = (state: State) => emptyResource; // state.volumes
export const nodeBalsSelector = (state: State) => emptyResource; // state.nodebalancers
export const imagesSelector = (state: State) => state.images;
export const typesSelector = (state: State) => state.types;

const isInitialLoad = (
  e: Resource<any, any> | RequestableDataWithEntityError<any> | ImageState
) => e.loading && e.lastUpdated === 0;

export default createSelector<
  State,
  MappedEntityState<Linode, EntityError>,
  Resource<Volume[]>,
  Resource<NodeBalancer[][]>,
  ImageState,
  Resource<LinodeType[]>,
  boolean
>(
  linodesSelector,
  volumesSelector,
  nodeBalsSelector,
  imagesSelector,
  typesSelector,
  (linodes, volumes, nodebalancers, images, types) => {
    const entities = [linodes, volumes, nodebalancers, images, types];
    const l = entities.length;
    for (let i = 0; i < l; i++) {
      if (isInitialLoad(entities[i])) {
        return true;
      }
    }
    return false;
  }
);
