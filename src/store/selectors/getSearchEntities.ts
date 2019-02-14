import { createSelector } from 'reselect';
import { Item } from 'src/components/EnhancedSelect/Select';
import { displayType } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';
import getLinodeDescription from 'src/utilities/getLinodeDescription';

export interface SearchResults {
  linodes: Item[];
  volumes: Item[];
  nodebalancers: Item[];
  domains: Item[];
  images: Item[];
}

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
): Item => ({
  label: linode.label,
  value: linode.id,
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

const volumeToItem = (volume: Linode.Volume) => ({
  label: volume.label,
  value: volume.id,
  data: {
    tags: volume.tags,
    description: volume.size + ' GiB',
    icon: 'volume',
    path: `/volumes/${volume.id}`,
    searchText: '',
    created: volume.created,
    region: volume.region
  }
});

const imageReducer = (accumulator: Item[], image: Linode.Image) =>
  image.is_public ? accumulator : [...accumulator, imageToItem(image)];

const imageToItem = (image: Linode.Image) => ({
  label: image.label,
  value: image.id,
  data: {
    tags: [],
    description: image.description || '',
    /* TODO: Update this with the Images icon! */
    icon: 'volume',
    /* TODO: Choose a real location for this to link to */
    path: `/images`,
    searchText: '',
    created: image.created
  }
});

const domainToItem = (domain: Linode.Domain) => ({
  label: domain.domain,
  value: domain.id,
  data: {
    tags: domain.tags,
    description: domain.type,
    status: domain.status,
    icon: 'domain',
    path: `/domains/${domain.id}`,
    searchText: '',
    ips: getDomainIps(domain)
  }
});

const nodeBalToItem = (nodebal: Linode.NodeBalancer) => ({
  label: nodebal.label,
  value: nodebal.id,
  data: {
    tags: nodebal.tags,
    description: nodebal.hostname,
    icon: 'nodebalancer',
    path: `/nodebalancers/${nodebal.id}`,
    searchText: '',
    created: nodebal.created,
    ips: getNodebalIps(nodebal)
  }
});

const linodeSelector = (state: State) => state.linodes.entities;
const volumeSelector = ({ volumes }: State) => Object.values(volumes.itemsById);
const nodebalSelector = ({ nodeBalancers }: State) =>
  Object.values(nodeBalancers.itemsById);
const imageSelector = (state: State) => state.images.entities;
const domainSelector = (state: State) => state.domains.entities;
const typesSelector = (state: State) => state.types.entities;

export default createSelector<
  State,
  Linode.Linode[],
  Linode.Volume[],
  Linode.Image[],
  Linode.Domain[],
  Linode.NodeBalancer[],
  Linode.LinodeType[],
  SearchResults
>(
  linodeSelector,
  volumeSelector,
  imageSelector,
  domainSelector,
  nodebalSelector,
  typesSelector,
  (linodes, volumes, images, domains, nodebalancers, types) => {
    return {
      linodes: linodes.map(linode => formatLinode(linode, types, images)),
      volumes: volumes.map(volumeToItem),
      images: images.reduce(imageReducer, []),
      domains: domains.map(domainToItem),
      nodebalancers: nodebalancers.map(nodeBalToItem)
    };
  }
);
