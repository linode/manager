import { createSelector } from 'reselect';
import { displayType } from 'src/features/linodes/presentation';
import { SearchableItem } from 'src/features/Search/search.interfaces';
import { ApplicationState } from 'src/store';
import getLinodeDescription from 'src/utilities/getLinodeDescription';

type State = ApplicationState['__resources'];

export const getLinodeIps = (linode: Linode.Linode): string[] => {
  const { ipv4, ipv6 } = linode;
  return ipv4.concat([ipv6]);
};

export const getDomainIps = (domain: Linode.Domain): string[] => {
  return domain.master_ips;
};

export const getNodebalIps = (nodebal: Linode.NodeBalancer): string[] => {
  const { ipv4, ipv6 } = nodebal;
  const ips: string[] = [ipv4];

  if (ipv6) {
    ips.push(ipv6);
  }
  return ips;
};

const formatLinode = (
  linode: Linode.Linode,
  types: Linode.LinodeType[],
  images: Linode.Image[]
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

const volumeToSearchableItem = (volume: Linode.Volume): SearchableItem => ({
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

const imageReducer = (accumulator: SearchableItem[], image: Linode.Image) =>
  image.is_public
    ? accumulator
    : [...accumulator, imageToSearchableItem(image)];

const imageToSearchableItem = (image: Linode.Image): SearchableItem => ({
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

const domainToSearchableItem = (domain: Linode.Domain): SearchableItem => ({
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

const nodeBalToSearchableItem = (
  nodebal: Linode.NodeBalancer
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

const linodeSelector = (state: State) => state.linodes.entities;
const volumeSelector = ({ volumes }: State) => Object.values(volumes.itemsById);
const nodebalSelector = ({ nodeBalancers }: State) =>
  Object.values(nodeBalancers.itemsById);
const imageSelector = (state: State) => state.images.entities;
const domainSelector = (state: State) => state.domains.data || [];
const typesSelector = (state: State) => state.types.entities;

export default createSelector<
  State,
  Linode.Linode[],
  Linode.Volume[],
  Linode.Image[],
  Linode.Domain[],
  Linode.NodeBalancer[],
  Linode.LinodeType[],
  SearchableItem[]
>(
  linodeSelector,
  volumeSelector,
  imageSelector,
  domainSelector,
  nodebalSelector,
  typesSelector,
  (linodes, volumes, images, domains, nodebalancers, types) => {
    const searchableLinodes = linodes.map(linode =>
      formatLinode(linode, types, images)
    );
    const searchableVolumes = volumes.map(volumeToSearchableItem);
    const searchableImages = images.reduce(imageReducer, []);
    const searchableDomains = domains.map(domainToSearchableItem);
    const searchableNodebalancers = nodebalancers.map(nodeBalToSearchableItem);

    return [
      ...searchableLinodes,
      ...searchableVolumes,
      ...searchableImages,
      ...searchableDomains,
      ...searchableNodebalancers
    ];
  }
);
