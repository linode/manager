import useDomains from './useDomains';
import useImages from './useImages';
import useKubernetesClusters from './useKubernetesClusters';
import useLinodes from './useLinodes';
import useNodeBalancers from './useNodeBalancers';
import useVolumes from './useVolumes';

export interface Entity<T> {
  data: T[];
  request: () => Promise<T[]>;
  lastUpdated: number;
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
  const { linodes: _linodes, requestLinodes } = useLinodes();
  const { domains: _domains, requestDomains } = useDomains();
  const { images: _images, requestImages } = useImages();
  const { volumes: _volumes, requestVolumes } = useVolumes();
  const {
    nodeBalancers: _nodeBalancers,
    requestNodeBalancers
  } = useNodeBalancers();
  const {
    kubernetesClusters: _kubernetesClusters,
    requestKubernetesClusters
  } = useKubernetesClusters();

  const linodes = _linodes.entities ?? [];
  const domains = _domains.data ?? [];
  const images = (Object.values(_images.data) ?? []).filter(
    thisImage => thisImage.is_public
  );
  const volumes = Object.values(_volumes.itemsById);
  const kubernetesClusters = _kubernetesClusters.entities;
  const nodeBalancers = Object.values(_nodeBalancers.itemsById);

  return {
    domains: {
      data: domains,
      request: requestDomains,
      lastUpdated: _domains.lastUpdated
    },
    images: {
      data: images,
      request: requestImages,
      lastUpdated: _images.lastUpdated
    },
    kubernetesClusters: {
      data: kubernetesClusters,
      request: requestKubernetesClusters,
      lastUpdated: _kubernetesClusters.lastUpdated
    },
    linodes: {
      data: linodes,
      request: requestLinodes,
      lastUpdated: _linodes.lastUpdated
    },
    nodeBalancers: {
      data: nodeBalancers,
      request: requestNodeBalancers,
      lastUpdated: _nodeBalancers.lastUpdated
    },
    volumes: {
      data: volumes,
      request: requestVolumes,
      lastUpdated: _volumes.lastUpdated
    }
  };
};

export default useEntities;
