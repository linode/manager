import { createSelector } from 'reselect';
import { Item } from 'src/components/EnhancedSelect/Select';
import { displayType } from 'src/features/linodes/presentation';
import getLinodeDescription from 'src/utilities/getLinodeDescription';

export interface SearchResults {
  linodes: Item[];
  volumes: Item[];
  nodebalancers: Item[];
  domains: Item[];
  images: Item[];
}

type State = ApplicationState['__resources'];

const formatLinode = (linode: Linode.Linode, types: Linode.LinodeType[], images: Linode.Image[]): Item =>
  ({
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
        images,
      ),
      icon: 'LinodeIcon',
      path: `/linodes/${linode.id}`,
      searchText: '', // @todo update this, either here or in the consumer. Probably in the consumer.
      created: linode.created,
      region: linode.region,
      status: linode.status,
    }
  });

const volumeToItem = (volume: Linode.Volume) => ({
  label: volume.label,
  value: volume.id,
  data: {
    tags: volume.tags,
    description: volume.size + ' GiB',
    icon: 'VolumeIcon',
    path: `/volumes/${volume.id}`,
    searchText: '',
    created: volume.created,
    region: volume.region,
  }
});

const imageReducer = (accumulator: Item[], image: Linode.Image) =>
  image.is_public ? accumulator : [...accumulator, imageToItem(image)]

const imageToItem = (image: Linode.Image) => ({
  label: image.label,
  value: image.id,
  data: {
    tags: [],
    description: image.description || '',
    /* TODO: Update this with the Images icon! */
    icon: 'VolumeIcon',
    /* TODO: Choose a real location for this to link to */
    path: `/images`,
    searchText: '',
    created: image.created,
  }
});

const domainToItem = (domain: Linode.Domain) => ({
  label: domain.domain,
  value: domain.id,
  data: {
    tags: domain.tags,
    description: domain.description || domain.status,
    icon: 'DomainIcon',
    path: `/domains/${domain.id}`,
    searchText: '',
  }
});

const nodeBalToItem = (nodebal: Linode.NodeBalancer) => ({
  label: nodebal.label,
  value: nodebal.id,
  data: {
    tags: nodebal.tags,
    description: nodebal.hostname,
    icon: 'NodebalIcon',
    path: `/nodebalancers/${nodebal.id}`,
    searchText: '',
    created: nodebal.created
  }
});

const linodeSelector = (state: State) => state.linodes.entities;
const volumeSelector = (state: State) => [] // state.volumes.entities;
const nodebalSelector = (state: State) => [] // state.nodebalancers;
const imageSelector = (state: State) => state.images.entities;
const domainSelector = (state: State) => state.domains.entities;
const typesSelector = (state: State) => state.types.entities;

export default createSelector
  <State,
  Linode.Linode[],
  Linode.Volume[],
  Linode.Image[],
  Linode.Domain[],
  Linode.NodeBalancer[],
  Linode.LinodeType[],
  SearchResults>(
  linodeSelector, volumeSelector, imageSelector, domainSelector, nodebalSelector, typesSelector,
  (linodes, volumes, images, domains, nodebalancers, types) => {
    return {
      linodes: linodes.map((linode) => formatLinode(linode, types, images)),
      volumes: volumes.map(volumeToItem),
      images: images.reduce(imageReducer, []),
      domains: domains.map(domainToItem),
      nodebalancers: nodebalancers.map(nodeBalToItem),
    }
  }
)