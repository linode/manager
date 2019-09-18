import { Domain } from 'linode-js-sdk/lib/domains';
import { Linode, LinodeType } from 'linode-js-sdk/lib/linodes';
import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { Volume } from 'linode-js-sdk/lib/volumes';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { EntityError, RequestableDataWithEntityError } from 'src/store/types';

import { State as ImageState } from 'src/store/image/image.reducer';

type State = ApplicationState['__resources'];

interface Resource<T, E = Linode.ApiFieldError[]> {
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
  lastUpdated: 0
};

export const linodesSelector = (state: State) => state.linodes;
export const volumesSelector = (state: State) => emptyResource; // state.volumes
export const nodeBalsSelector = (state: State) => emptyResource; // state.nodebalancers
export const domainsSelector = (state: State) => state.domains;
export const imagesSelector = (state: State) => state.images;
export const typesSelector = (state: State) => state.types;

const isInitialLoad = (
  e: Resource<any, any> | RequestableDataWithEntityError<any> | ImageState
) => e.loading && e.lastUpdated === 0;

export default createSelector<
  State,
  Resource<Linode[], EntityError>,
  Resource<Volume[]>,
  Resource<NodeBalancer[][]>,
  RequestableDataWithEntityError<Domain[]>,
  ImageState,
  Resource<LinodeType[]>,
  boolean
>(
  linodesSelector,
  volumesSelector,
  nodeBalsSelector,
  domainsSelector,
  imagesSelector,
  typesSelector,
  (linodes, volumes, nodebalancers, domains, images, types) => {
    const entities = [linodes, volumes, nodebalancers, domains, images, types];
    const l = entities.length;
    for (let i = 0; i < l; i++) {
      if (isInitialLoad(entities[i])) {
        return true;
      }
    }
    return false;
  }
);
