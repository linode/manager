import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import {
  bucketToSearchableItem,
  databaseToSearchableItem,
  domainToSearchableItem,
  firewallToSearchableItem,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  linodeToSearchableItem,
  nodeBalToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';

import { search } from './utils';

import type { SearchableEntityType } from './search.interfaces';

interface Props {
  enabled: boolean;
  query: string;
}

/**
 * Fetches all entities on a user's account and performs client-side filtering
 * based on a user's seach query.
 */
export const useClientSideSearch = ({ enabled, query }: Props) => {
  const { data: domains, isLoading: domainsLoading } = useAllDomainsQuery(
    enabled
  );
  const {
    data: clusters,
    isLoading: lkeClustersLoading,
  } = useAllKubernetesClustersQuery(enabled);
  const { data: volumes, isLoading: volumesLoading } = useAllVolumesQuery(
    {},
    {},
    enabled
  );
  const { data: linodes, isLoading: linodesLoading } = useAllLinodesQuery(
    {},
    {},
    enabled
  );
  const {
    data: nodebals,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(enabled);
  const { data: firewalls, isLoading: firewallsLoading } = useAllFirewallsQuery(
    enabled
  );
  const { data: databases, isLoading: databasesLoading } = useAllDatabasesQuery(
    enabled
  );
  const {
    data: objectStorageBuckets,
    isLoading: bucketsLoading,
  } = useObjectStorageBuckets(enabled);
  const {
    data: privateImages,
    isLoading: privateImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, enabled);

  const searchableDomains = domains?.map(domainToSearchableItem) ?? [];
  const searchableVolumes = volumes?.map(volumeToSearchableItem) ?? [];
  const searchableImages = privateImages?.map(imageToSearchableItem) ?? [];
  const searchableNodebalancers = nodebals?.map(nodeBalToSearchableItem) ?? [];
  const searchableFirewalls = firewalls?.map(firewallToSearchableItem) ?? [];
  const searchableDatabases = databases?.map(databaseToSearchableItem) ?? [];
  const searchableBuckets =
    objectStorageBuckets?.buckets.map(bucketToSearchableItem) ?? [];
  const searchableLinodes = linodes?.map(linodeToSearchableItem) ?? [];
  const searchableClusters =
    clusters?.map((cluster) => kubernetesClusterToSearchableItem(cluster)) ?? [];

  const searchableItems = [
    ...searchableLinodes,
    ...searchableImages,
    ...searchableBuckets,
    ...searchableDomains,
    ...searchableVolumes,
    ...searchableClusters,
    ...searchableNodebalancers,
    ...searchableFirewalls,
    ...searchableDatabases,
  ];

  const isLoading =
    linodesLoading ||
    privateImagesLoading ||
    bucketsLoading ||
    lkeClustersLoading ||
    databasesLoading ||
    nodebalancersLoading ||
    domainsLoading ||
    volumesLoading ||
    firewallsLoading;

  const entityErrors: Record<SearchableEntityType, string | null> = {
    bucket: null,
    database: null,
    domain: null,
    firewall: null,
    image: null,
    kubernetesCluster: null,
    linode: null,
    nodebalancer: null,
    stackscript: null,
    volume: null
  };

  const { combinedResults, searchResultsByEntity } = search(
    searchableItems,
    query
  );

  return {
    combinedResults,
    entityErrors,
    isLoading,
    searchResultsByEntity,
  };
};
