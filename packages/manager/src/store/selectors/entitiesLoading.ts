import { Volume } from 'linode-js-sdk/lib/volumes';
import { createSelector } from 'reselect';
import { ApplicationState } from 'src/store';
import { EntityError, RequestableDataWithEntityError } from 'src/store/types';

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
  e: Resource<any, any> | RequestableDataWithEntityError<any>
) => e.loading && e.lastUpdated === 0;

export default createSelector<
  State,
  Resource<Linode.Linode[], EntityError>,
  Resource<Volume[]>,
  Resource<Linode.NodeBalancer[][]>,
  RequestableDataWithEntityError<Linode.Domain[]>,
  Resource<Linode.Image[]>,
  Resource<Linode.LinodeType[]>,
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
