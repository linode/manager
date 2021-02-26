import { APIError } from '@linode/api-v4/lib/types';
import useDomains from './useDomains';
import useImages from './useImages';
import useKubernetesClusters from './useKubernetesClusters';
import useLinodeActions from './useLinodeActions';
import useLinodes from './useLinodes';
import useNodeBalancers from './useNodeBalancers';
import useVolumes from './useVolumes';

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
  const { domains: _domains, requestDomains } = useDomains();
  const { images: _images, requestImages } = useImages();
  const { volumes: _volumes, requestVolumes } = useVolumes();
  const {
    nodeBalancers: _nodeBalancers,
    requestNodeBalancers,
  } = useNodeBalancers();
  const {
    kubernetesClusters: _kubernetesClusters,
    requestKubernetesClusters,
  } = useKubernetesClusters();

  /** Our Redux store is currently inconsistent about
   * the data shape for different entity types.
   * The purpose of this meta-container is to expose
   * a single, consistent interface so that consumers
   * can map through different entity types without
   * worrying about whether they should use data.entities
   * or Object.value(data.itemsById).
   */

  const domains = Object.values(_domains.itemsById);
  const linodes = Object.values(_linodes.itemsById);
  const images = (Object.values(_images.itemsById) ?? []).filter(
    thisImage => !thisImage.is_public
  );
  const volumes = Object.values(_volumes.itemsById);
  const kubernetesClusters = Object.values(_kubernetesClusters.itemsById);
  const nodeBalancers = Object.values(_nodeBalancers.itemsById);

  return {
    domains: {
      data: domains,
      request: requestDomains,
      lastUpdated: _domains.lastUpdated,
      error: _domains.error.read,
    },
    images: {
      data: images,
      request: requestImages,
      lastUpdated: _images.lastUpdated,
      error: _images.error.read,
    },
    kubernetesClusters: {
      data: kubernetesClusters,
      request: () => requestKubernetesClusters(),
      lastUpdated: _kubernetesClusters.lastUpdated,
      error: _kubernetesClusters.error?.read,
    },
    linodes: {
      data: linodes,
      request: requestLinodes,
      lastUpdated: _linodes.lastUpdated,
      error: _linodes.error?.read,
    },
    nodeBalancers: {
      data: nodeBalancers,
      request: () => requestNodeBalancers().then(response => response.data),
      lastUpdated: _nodeBalancers.lastUpdated,
      error: _nodeBalancers.error?.read,
    },
    volumes: {
      data: volumes,
      request: () => requestVolumes().then(response => response.data),
      lastUpdated: _volumes.lastUpdated,
      error: _volumes.error?.read,
    },
  };
};

export default useEntities;
