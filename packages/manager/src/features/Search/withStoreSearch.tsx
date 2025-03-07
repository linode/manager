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
  formatLinode,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  nodeBalToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';

import { getImageLabelForLinode } from '../Images/utils';
import { search } from './utils';

interface Props {
  query: string;
}

export const useLegacySearch = ({ query }: Props) => {
  const isSearching = Boolean(query);
  const isLargeAccount = useIsLargeAccount(isSearching);
  const shouldFetchAll =
    isSearching && isLargeAccount !== undefined && !isLargeAccount;

  const { data: regions } = useRegionsQuery();
  const { data: objectStorageBuckets } = useObjectStorageBuckets(
    shouldFetchAll
  );
  const { data: domains } = useAllDomainsQuery(shouldFetchAll);
  const { data: clusters } = useAllKubernetesClustersQuery(shouldFetchAll);
  const { data: volumes } = useAllVolumesQuery({}, {}, shouldFetchAll);
  const { data: nodebalancers } = useAllNodeBalancersQuery(shouldFetchAll);
  const { data: firewalls } = useAllFirewallsQuery(shouldFetchAll);
  const { data: databases } = useAllDatabasesQuery(shouldFetchAll);
  const { data: _privateImages, isLoading: imagesLoading } = useAllImagesQuery(
    {},
    { is_public: false }, // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)
    shouldFetchAll
  );
  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    isSearching
  );
  const { data: linodes, isLoading: linodesLoading } = useAllLinodesQuery(
    {},
    {},
    shouldFetchAll
  );

  const searchableLinodes = (linodes ?? []).map((linode) => {
    const imageLabel = getImageLabelForLinode(linode, publicImages ?? []);
    return formatLinode(linode, [], imageLabel);
  });

  const searchableBuckets =
    objectStorageBuckets?.buckets.map((bucket) =>
      bucketToSearchableItem(bucket)
    ) ?? [];
  const searchableDomains =
    domains?.map((domain) => domainToSearchableItem(domain)) ?? [];
  const searchableVolumes =
    volumes?.map((volume) => volumeToSearchableItem(volume)) ?? [];
  const searchableImages =
    _privateImages?.map((image) => imageToSearchableItem(image)) ?? [];
  const searchableClusters =
    clusters?.map((cluster) =>
      kubernetesClusterToSearchableItem(cluster, regions ?? [])
    ) ?? [];
  const searchableNodebalancers =
    nodebalancers?.map((nodebalancer) =>
      nodeBalToSearchableItem(nodebalancer)
    ) ?? [];
  const searchableFirewalls =
    firewalls?.map((firewall) => firewallToSearchableItem(firewall)) ?? [];
  const searchableDatabases =
    databases?.map((database) => databaseToSearchableItem(database)) ?? [];

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

  const isLoading = linodesLoading || imagesLoading;

  const results = search(searchableItems, query);

  return {
    ...results,
    isLargeAccount,
    isLoading,
  };
};
