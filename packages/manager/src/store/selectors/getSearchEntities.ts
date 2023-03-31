import { Domain } from '@linode/api-v4/lib/domains';
import { Image } from '@linode/api-v4/lib/images';
import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { Volume } from '@linode/api-v4/lib/volumes';
import { createSelector } from 'reselect';
import { displayType } from 'src/features/linodes/presentation';
import { getDescriptionForCluster } from 'src/features/Kubernetes/kubeUtils';
import { SearchableItem } from 'src/features/Search/search.interfaces';
import { ApplicationState } from 'src/store';
import { getLinodeDescription } from 'src/utilities/getLinodeDescription';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { readableBytes } from 'src/utilities/unitConversions';
import { ExtendedType } from 'src/utilities/extendType';
import { Region } from '@linode/api-v4/lib/regions';

export type State = ApplicationState['__resources'];

export const getLinodeIps = (linode: Linode): string[] => {
  const { ipv4, ipv6 } = linode;
  return ipv4.concat([ipv6 || '']);
};

export const getDomainIps = (domain: Domain): string[] => {
  return domain.master_ips;
};

export const getNodebalIps = (nodebal: NodeBalancer): string[] => {
  const { ipv4, ipv6 } = nodebal;
  const ips: string[] = [ipv4];

  if (ipv6) {
    ips.push(ipv6);
  }
  return ips;
};

export const formatLinode = (
  linode: Linode,
  types: ExtendedType[],
  images: Record<string, Image>
): SearchableItem => ({
  label: linode.label,
  value: linode.id,
  entityType: 'linode',
  data: {
    tags: linode.tags,
    description: getLinodeDescription(
      displayType(linode.type, types),
      linode.specs.memory,
      linode.specs.disk,
      linode.specs.vcpus,
      linode.image,
      images
    ),
    icon: 'linode',
    path: `/linodes/${linode.id}`,
    searchText: '', // @todo update this, either here or in the consumer. Probably in the consumer.
    created: linode.created,
    region: linode.region,
    status: linode.status,
    ips: getLinodeIps(linode),
  },
});

export const volumeToSearchableItem = (volume: Volume): SearchableItem => ({
  label: volume.label,
  value: volume.id,
  entityType: 'volume',
  data: {
    tags: volume.tags,
    description: volume.size + ' GB',
    icon: 'volume',
    path: `/volumes/${volume.id}`,
    created: volume.created,
    region: volume.region,
  },
});

export const imageReducer = (accumulator: SearchableItem[], image: Image) =>
  image.is_public
    ? accumulator
    : [...accumulator, imageToSearchableItem(image)];

export const imageToSearchableItem = (image: Image): SearchableItem => ({
  label: image.label,
  value: image.id,
  entityType: 'image',
  data: {
    tags: [],
    description: image.description || '',
    /* TODO: Update this with the Images icon! */
    icon: 'volume',
    /* TODO: Choose a real location for this to link to */
    path: `/images`,
    created: image.created,
  },
});

export const domainToSearchableItem = (domain: Domain): SearchableItem => ({
  label: domain.domain,
  value: domain.id,
  entityType: 'domain',
  data: {
    tags: domain.tags,
    description: domain.type === 'master' ? 'primary' : 'secondary',
    status: domain.status,
    icon: 'domain',
    path: `/domains/${domain.id}`,
    ips: getDomainIps(domain),
  },
});

export const nodeBalToSearchableItem = (
  nodebal: NodeBalancer
): SearchableItem => ({
  label: nodebal.label,
  value: nodebal.id,
  entityType: 'nodebalancer',
  data: {
    tags: nodebal.tags,
    description: nodebal.hostname,
    icon: 'nodebalancer',
    path: `/nodebalancers/${nodebal.id}`,
    created: nodebal.created,
    ips: getNodebalIps(nodebal),
    region: nodebal.region,
  },
});

export const kubernetesClusterToSearchableItem = (
  kubernetesCluster: KubernetesCluster,
  regions: Region[]
): SearchableItem => ({
  label: kubernetesCluster.label,
  value: kubernetesCluster.id,
  entityType: 'kubernetesCluster',
  data: {
    icon: 'kube',
    path: `/kubernetes/clusters/${kubernetesCluster.id}/summary`,
    status: kubernetesCluster.status,
    created: kubernetesCluster.created,
    updated: kubernetesCluster.updated,
    label: kubernetesCluster.label,
    region: kubernetesCluster.region,
    k8s_version: kubernetesCluster.k8s_version,
    tags: kubernetesCluster.tags,
    description: getDescriptionForCluster(kubernetesCluster, regions),
  },
});

export const bucketToSearchableItem = (
  bucket: ObjectStorageBucket
): SearchableItem => ({
  label: bucket.label,
  value: `${bucket.cluster}/${bucket.label}`,
  entityType: 'bucket',
  data: {
    icon: 'bucket',
    path: `/object-storage/buckets/${bucket.cluster}/${bucket.label}`,
    created: bucket.created,
    label: bucket.label,
    cluster: bucket.cluster,
    description: readableBytes(bucket.size).formatted,
  },
});

const nodebalSelector = ({ nodeBalancers }: State) =>
  Object.values(nodeBalancers.itemsById);

export default createSelector(nodebalSelector, (nodebalancers) => {
  const searchableNodebalancers = nodebalancers.map(nodeBalToSearchableItem);

  return [...searchableNodebalancers];
});
