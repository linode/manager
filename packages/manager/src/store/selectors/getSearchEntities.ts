import { pluralize } from '@linode/utilities';
import { readableBytes } from '@linode/utilities';

import { getDatabasesDescription } from 'src/features/Databases/utilities';
import { getFirewallDescription } from 'src/features/Firewalls/shared';
import { getDescriptionForCluster } from 'src/features/Kubernetes/kubeUtils';

import type {
  DatabaseInstance,
  Domain,
  Firewall,
  Image,
  KubernetesCluster,
  Linode,
  NodeBalancer,
  ObjectStorageBucket,
  StackScript,
  Volume,
} from '@linode/api-v4';
import type { SearchableItem } from 'src/features/Search/search.interfaces';

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

export const linodeToSearchableItem = (linode: Linode): SearchableItem => ({
  data: {
    created: linode.created,
    description: `${linode.image}, ${linode.specs.vcpus} CPU, ${
      linode.specs.disk / 1024
    } GB Storage, ${linode.specs.memory / 1024} GB RAM`,
    ips: getLinodeIps(linode),
    path: `/linodes/${linode.id}`,
    region: linode.region,
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
    path: `/volumes?query=${volume.label}`,
    region: volume.region,
    tags: volume.tags,
  },
  entityType: 'volume',
  label: volume.label,
  value: volume.id,
});

export const imageToSearchableItem = (image: Image): SearchableItem => ({
  data: {
    created: image.created,
    description:
      image.description && image.description.length > 1
        ? image.description
        : `${image.size} MB, Replicated in ${pluralize(
            'region',
            'regions',
            image.regions.length
          )}`,
    icon: 'image',
    path: `/images?query="${image.label}"`,
    tags: image.tags,
  },
  entityType: 'image',
  label: image.label,
  value: image.id,
});

export const domainToSearchableItem = (domain: Domain): SearchableItem => ({
  data: {
    description: domain.type === 'master' ? 'primary' : 'secondary',
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
  kubernetesCluster: KubernetesCluster
): SearchableItem => ({
  data: {
    created: kubernetesCluster.created,
    description: getDescriptionForCluster(kubernetesCluster),
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
    description: readableBytes(bucket.size, { base10: true }).formatted,
    icon: 'storage',
    label: bucket.label,
    path: `/object-storage/buckets/${bucket.cluster}/${bucket.label}`,
  },
  entityType: 'bucket',
  label: bucket.label,
  value: `${bucket.cluster}/${bucket.label}`,
});

export const firewallToSearchableItem = (
  firewall: Firewall
): SearchableItem => ({
  data: {
    created: firewall.created,
    description: getFirewallDescription(firewall),
    path: `/firewalls/${firewall.id}`,
    tags: firewall.tags,
  },
  entityType: 'firewall',
  label: firewall.label,
  value: firewall.id,
});

export const databaseToSearchableItem = (
  database: DatabaseInstance
): SearchableItem => ({
  data: {
    created: database.created,
    description: getDatabasesDescription(database),
    path: `/databases/${database.engine}/${database.id}`,
    region: database.region,
    status: database.status,
  },
  entityType: 'database',
  label: database.label,
  value: `${database.engine}/${database.id}`,
});

export const stackscriptToSearchableItem = (
  stackscript: StackScript
): SearchableItem => ({
  data: {
    created: stackscript.created,
    description: stackscript.description
      ? stackscript.description
      : `${stackscript.deployments_total} deploys, ${stackscript.deployments_active} active deployments`,
    path: `/stackscripts/${stackscript.id}`,
  },
  entityType: 'stackscript',
  label: stackscript.label,
  value: stackscript.id,
});
