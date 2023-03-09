import { APIError } from '@linode/api-v4/lib/types';
import useLinodeActions from './useLinodeActions';
import useLinodes from './useLinodes';
import useNodeBalancers from './useNodeBalancers';

export interface Entity<T> {
  data: T[];
  request: () => Promise<T[]>;
  lastUpdated: number;
  error?: APIError[];
}

/**
 * Returns data for each entity type in array format,
 * along with the request thunk for each of the entity types.
 *
 * @example
 *
 * const { linodes, volumes } = useEntities();
 * linodes.map(thisLinode => thisLinode.label);
 * if (linodes.lastUpdated === 0) { linodes.request(); }
 */
export const useEntities = () => {
  const { linodes: _linodes } = useLinodes();
  const { requestLinodes } = useLinodeActions();
  const {
    nodeBalancers: _nodeBalancers,
    requestNodeBalancers,
  } = useNodeBalancers();

  /** Our Redux store is currently inconsistent about
   * the data shape for different entity types.
   * The purpose of this meta-container is to expose
   * a single, consistent interface so that consumers
   * can map through different entity types without
   * worrying about whether they should use data.entities
   * or Object.value(data.itemsById).
   */

  const linodes = Object.values(_linodes.itemsById);
  const nodeBalancers = Object.values(_nodeBalancers.itemsById);

  return {
    linodes: {
      data: linodes,
      request: requestLinodes,
      lastUpdated: _linodes.lastUpdated,
      error: _linodes.error?.read,
    },
    nodeBalancers: {
      data: nodeBalancers,
      request: () => requestNodeBalancers().then((response) => response.data),
      lastUpdated: _nodeBalancers.lastUpdated,
      error: _nodeBalancers.error?.read,
    },
  };
};

export default useEntities;
