import { useAllLinodesQuery } from '@linode/queries';
import { useAllFirewallsQuery } from '@linode/queries';
import { useAllVolumesQuery } from '@linode/queries';
import { useAllNodeBalancersQuery } from '@linode/queries';
import { useAllAccountStackScriptsQuery } from '@linode/queries';

import { useKubernetesBetaEndpoint } from 'src/features/Kubernetes/kubeUtils';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import {
  bucketToSearchableItem,
  databaseToSearchableItem,
  domainToSearchableItem,
  firewallToSearchableItem,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  linodeToSearchableItem,
  nodeBalToSearchableItem,
  stackscriptToSearchableItem,
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
  const {
    data: domains,
    error: domainsError,
    isLoading: domainsLoading,
  } = useAllDomainsQuery(enabled);
  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();
  const {
    data: clusters,
    error: lkeClustersError,
    isLoading: lkeClustersLoading,
  } = useAllKubernetesClustersQuery({ enabled, isUsingBetaEndpoint });
  const {
    data: volumes,
    error: volumesError,
    isLoading: volumesLoading,
  } = useAllVolumesQuery({}, {}, enabled);
  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, enabled);
  const {
    data: nodebals,
    error: nodebalancersError,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(enabled);
  const {
    data: firewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useAllFirewallsQuery(enabled);
  const {
    data: databases,
    error: databasesError,
    isLoading: databasesLoading,
  } = useAllDatabasesQuery(enabled);
  const {
    data: objectStorageBuckets,
    error: bucketsError,
  } = useObjectStorageBuckets(enabled);
  const {
    data: privateImages,
    error: imagesError,
    isLoading: privateImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, enabled);
  const {
    data: stackscripts,
    error: stackscriptsError,
    isLoading: stackscriptsLoading,
  } = useAllAccountStackScriptsQuery(enabled);

  const searchableDomains = domains?.map(domainToSearchableItem) ?? [];
  const searchableVolumes = volumes?.map(volumeToSearchableItem) ?? [];
  const searchableImages = privateImages?.map(imageToSearchableItem) ?? [];
  const searchableNodebalancers = nodebals?.map(nodeBalToSearchableItem) ?? [];
  const searchableFirewalls = firewalls?.map(firewallToSearchableItem) ?? [];
  const searchableDatabases = databases?.map(databaseToSearchableItem) ?? [];
  const searchableLinodes = linodes?.map(linodeToSearchableItem) ?? [];
  const searchableStackScripts =
    stackscripts?.map(stackscriptToSearchableItem) ?? [];
  const searchableBuckets =
    objectStorageBuckets?.buckets.map(bucketToSearchableItem) ?? [];
  const searchableClusters =
    clusters?.map(kubernetesClusterToSearchableItem) ?? [];

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
    ...searchableStackScripts,
  ];

  const isLoading =
    linodesLoading ||
    privateImagesLoading ||
    lkeClustersLoading ||
    databasesLoading ||
    nodebalancersLoading ||
    domainsLoading ||
    volumesLoading ||
    firewallsLoading ||
    stackscriptsLoading;

  const entityErrors: Record<SearchableEntityType, null | string> = {
    bucket: bucketsError?.message ?? null,
    database: databasesError?.[0].reason ?? null,
    domain: domainsError?.[0].reason ?? null,
    firewall: firewallsError?.[0].reason ?? null,
    image: imagesError?.[0].reason ?? null,
    kubernetesCluster: lkeClustersError?.[0].reason ?? null,
    linode: linodesError?.[0].reason ?? null,
    nodebalancer: nodebalancersError?.[0].reason ?? null,
    stackscript: stackscriptsError?.[0].reason ?? null,
    volume: volumesError?.[0].reason ?? null,
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
