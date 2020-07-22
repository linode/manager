import { Domain } from '@linode/api-v4/lib/domains';
import { Image } from '@linode/api-v4/lib/images';
import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { Linode, LinodeType } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { Volume } from '@linode/api-v4/lib/volumes';
import { createSelector } from 'reselect';
import { displayType } from 'src/features/linodes/presentation';
import {
  extendCluster,
  getDescriptionForCluster
} from 'src/features/Kubernetes/kubeUtils';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { SearchableItem } from 'src/features/Search/search.interfaces';
import { ApplicationState } from 'src/store';
import { ExtendedNodePool } from 'src/store/kubernetes/nodePools.actions';
import getLinodeDescription from 'src/utilities/getLinodeDescription';

type State = ApplicationState['__resources'];

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
  types: LinodeType[],
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
      linode.image!,
      images
    ),
    icon: 'linode',
    path: `/linodes/${linode.id}`,
    searchText: '', // @todo update this, either here or in the consumer. Probably in the consumer.
    created: linode.created,
    region: linode.region,
    status: linode.status,
    ips: getLinodeIps(linode)
  }
});

export const volumeToSearchableItem = (volume: Volume): SearchableItem => ({
  label: volume.label,
  value: volume.id,
  entityType: 'volume',
  data: {
    tags: volume.tags,
    description: volume.size + ' GiB',
    icon: 'volume',
    path: `/volumes/${volume.id}`,
    created: volume.created,
    region: volume.region
  }
});

const imageReducer = (accumulator: SearchableItem[], image: Image) =>
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
    created: image.created
  }
});

export const domainToSearchableItem = (domain: Domain): SearchableItem => ({
  label: domain.domain,
  value: domain.id,
  entityType: 'domain',
  data: {
    tags: domain.tags,
    description: domain.type,
    status: domain.status,
    icon: 'domain',
    path: `/domains/${domain.id}`,
    ips: getDomainIps(domain)
  }
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
    ips: getNodebalIps(nodebal)
  }
});

export const kubernetesClusterToSearchableItem = (
  kubernetesCluster: ExtendedCluster
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
    description: getDescriptionForCluster(kubernetesCluster)
  }
});

const linodeSelector = (state: State) => Object.values(state.linodes.itemsById);
const volumeSelector = ({ volumes }: State) => Object.values(volumes.itemsById);
const nodebalSelector = ({ nodeBalancers }: State) =>
  Object.values(nodeBalancers.itemsById);
const imageSelector = (state: State) => state.images.itemsById || {};
const domainSelector = (state: State) =>
  Object.values(state.domains.itemsById) || [];
const typesSelector = (state: State) => state.types.entities;
const kubernetesClusterSelector = (state: State) =>
  Object.values(state.kubernetes.itemsById);
const kubePoolSelector = (state: State) => state.nodePools.entities;

export default createSelector<
  State,
  Linode[],
  Volume[],
  { [key: string]: Image },
  Domain[],
  NodeBalancer[],
  LinodeType[],
  KubernetesCluster[],
  ExtendedNodePool[],
  SearchableItem[]
>(
  linodeSelector,
  volumeSelector,
  imageSelector,
  domainSelector,
  nodebalSelector,
  typesSelector,
  kubernetesClusterSelector,
  kubePoolSelector,
  (
    linodes,
    volumes,
    images,
    domains,
    nodebalancers,
    types,
    kubernetesClusters,
    nodePools
  ) => {
    const arrOfImages = Object.values(images);
    const searchableLinodes = linodes.map(linode =>
      formatLinode(linode, types, images)
    );
    const searchableVolumes = volumes.map(volumeToSearchableItem);
    const searchableImages = arrOfImages.reduce(imageReducer, []);
    const searchableDomains = domains.map(domainToSearchableItem);
    const searchableNodebalancers = nodebalancers.map(nodeBalToSearchableItem);
    const searchableKubernetesClusters = kubernetesClusters
      .map(thisCluster => {
        const pools = nodePools.filter(
          thisPool => thisPool.clusterID === thisCluster.id
        );
        return extendCluster(thisCluster, pools, types);
      })
      .map(kubernetesClusterToSearchableItem);

    return [
      ...searchableLinodes,
      ...searchableVolumes,
      ...searchableImages,
      ...searchableDomains,
      ...searchableNodebalancers,
      ...searchableKubernetesClusters
    ];
  }
);
