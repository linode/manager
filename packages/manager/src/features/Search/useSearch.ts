import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';
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

import { getImageLabelForLinode } from '../Images/utils';
import { search } from './utils';

interface Props {
  query: string;
}

export const useSearch = ({ query }: Props) => {
  const isSearching = Boolean(query);
  const isLargeAccount = useIsLargeAccount(isSearching);
  const shouldFetchAll =
    isSearching && isLargeAccount !== undefined && !isLargeAccount;

  const { data: regions, isLoading: regionsLoading } = useRegionsQuery(
    shouldFetchAll
  );
  const { data: domains, isLoading: domainsLoading } = useAllDomainsQuery(
    shouldFetchAll
  );
  const {
    data: clusters,
    isLoading: lkeClustersLoading,
  } = useAllKubernetesClustersQuery(shouldFetchAll);
  const { data: volumes, isLoading: volumesLoading } = useAllVolumesQuery(
    {},
    {},
    shouldFetchAll
  );
  const {
    data: nodebals,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(shouldFetchAll);
  const { data: firewalls, isLoading: firewallsLoading } = useAllFirewallsQuery(
    shouldFetchAll
  );
  const { data: databases, isLoading: databasesLoading } = useAllDatabasesQuery(
    shouldFetchAll
  );
  const {
    data: objectStorageBuckets,
    isLoading: bucketsLoading,
  } = useObjectStorageBuckets(shouldFetchAll);
  const {
    data: privateImages,
    isLoading: privateImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, shouldFetchAll);
  const {
    data: publicImages,
    isLoading: publicIamgesLoading,
  } = useAllImagesQuery({}, { is_public: true }, isSearching);
  const { data: linodes, isLoading: linodesLoading } = useAllLinodesQuery(
    {},
    {},
    shouldFetchAll
  );

  const searchableLinodes = (linodes ?? []).map((linode) => {
    const imageLabel = getImageLabelForLinode(linode, publicImages ?? []);
    return linodeToSearchableItem(linode, [], imageLabel);
  });

  const searchableClusters =
    clusters?.map((cluster) =>
      kubernetesClusterToSearchableItem(cluster, regions ?? [])
    ) ?? [];
  const searchableBuckets =
    objectStorageBuckets?.buckets.map(bucketToSearchableItem) ?? [];
  const searchableDomains = domains?.map(domainToSearchableItem) ?? [];
  const searchableVolumes = volumes?.map(volumeToSearchableItem) ?? [];
  const searchableImages = privateImages?.map(imageToSearchableItem) ?? [];
  const searchableNodebalancers = nodebals?.map(nodeBalToSearchableItem) ?? [];
  const searchableFirewalls = firewalls?.map(firewallToSearchableItem) ?? [];
  const searchableDatabases = databases?.map(databaseToSearchableItem) ?? [];

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
    publicIamgesLoading ||
    bucketsLoading ||
    lkeClustersLoading ||
    databasesLoading ||
    nodebalancersLoading ||
    domainsLoading ||
    regionsLoading ||
    volumesLoading ||
    firewallsLoading ||
    useIsLargeAccount === undefined;

  const results = search(searchableItems, query);

  return {
    ...results,
    isLargeAccount,
    isLoading,
  };
};
