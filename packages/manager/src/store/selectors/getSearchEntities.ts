import { Domain } from '@linode/api-v4/lib/domains';
import { Image } from '@linode/api-v4/lib/images';
import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import { Region } from '@linode/api-v4/lib/regions';
import { Volume } from '@linode/api-v4/lib/volumes';

import { getDescriptionForCluster } from 'src/features/Kubernetes/kubeUtils';
import { displayType } from 'src/features/Linodes/presentation';
import { SearchableItem } from 'src/features/Search/search.interfaces';
import { ExtendedType } from 'src/utilities/extendType';
import { getLinodeDescription } from 'src/utilities/getLinodeDescription';
import { readableBytes } from 'src/utilities/unitConversions';

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
  imageLabel: null | string
): SearchableItem => ({
  data: {
    created: linode.created,
    description: getLinodeDescription(
      displayType(linode.type, types),
      linode.specs.memory,
      linode.specs.disk,
      linode.specs.vcpus,
      imageLabel
    ),
    icon: 'linode',
    ips: getLinodeIps(linode),
    path: `/linodes/${linode.id}`,
    region: linode.region,
    searchText: '', // @todo update this, either here or in the consumer. Probably in the consumer.
    status: linode.status,
    tags: linode.tags,
  },
  entityType: 'linode',
  label: linode.label,
  value: linode.id,
});

export const volumeToSearchableItem = (volume: Volume): SearchableItem => ({
  data: {
    created: volume.created,
    description: volume.size + ' GB',
    icon: 'volume',
    path: `/volumes/${volume.id}`,
    region: volume.region,
    tags: volume.tags,
  },
  entityType: 'volume',
  label: volume.label,
  value: volume.id,
});

export const imageReducer = (accumulator: SearchableItem[], image: Image) =>
  image.is_public
    ? accumulator
    : [...accumulator, imageToSearchableItem(image)];

export const imageToSearchableItem = (image: Image): SearchableItem => ({
  data: {
    created: image.created,
    description: image.description || '',
    /* TODO: Update this with the Images icon! */
    icon: 'volume',
    /* TODO: Choose a real location for this to link to */
    path: `/images`,
    tags: [],
  },
  entityType: 'image',
  label: image.label,
  value: image.id,
});

export const domainToSearchableItem = (domain: Domain): SearchableItem => ({
  data: {
    description: domain.type === 'master' ? 'primary' : 'secondary',
    icon: 'domain',
    ips: getDomainIps(domain),
    path: `/domains/${domain.id}`,
    status: domain.status,
    tags: domain.tags,
  },
  entityType: 'domain',
  label: domain.domain,
  value: domain.id,
});

export const nodeBalToSearchableItem = (
  nodebal: NodeBalancer
): SearchableItem => ({
  data: {
    created: nodebal.created,
    description: nodebal.hostname,
    icon: 'nodebalancer',
    ips: getNodebalIps(nodebal),
    path: `/nodebalancers/${nodebal.id}`,
    region: nodebal.region,
    tags: nodebal.tags,
  },
  entityType: 'nodebalancer',
  label: nodebal.label,
  value: nodebal.id,
});

export const kubernetesClusterToSearchableItem = (
  kubernetesCluster: KubernetesCluster,
  regions: Region[]
): SearchableItem => ({
  data: {
    created: kubernetesCluster.created,
    description: getDescriptionForCluster(kubernetesCluster, regions),
    icon: 'kube',
    k8s_version: kubernetesCluster.k8s_version,
    label: kubernetesCluster.label,
    path: `/kubernetes/clusters/${kubernetesCluster.id}/summary`,
    region: kubernetesCluster.region,
    status: kubernetesCluster.status,
    tags: kubernetesCluster.tags,
    updated: kubernetesCluster.updated,
  },
  entityType: 'kubernetesCluster',
  label: kubernetesCluster.label,
  value: kubernetesCluster.id,
});

export const bucketToSearchableItem = (
  bucket: ObjectStorageBucket
): SearchableItem => ({
  data: {
    cluster: bucket.cluster,
    created: bucket.created,
    description: readableBytes(bucket.size).formatted,
    icon: 'bucket',
    label: bucket.label,
    path: `/object-storage/buckets/${bucket.cluster}/${bucket.label}`,
  },
  entityType: 'bucket',
  label: bucket.label,
  value: `${bucket.cluster}/${bucket.label}`,
});
