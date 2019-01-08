import { or } from 'ramda';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import { Item } from 'src/components/EnhancedSelect/Select';
import { reportException } from 'src/exceptionReporting';
import { displayType, typeLabelLong } from 'src/features/linodes/presentation';
import getLinodeDescription from 'src/utilities/getLinodeDescription';

export interface SearchResults {
  linodes: Item[];
  volumes: Item[];
  nodebalancers: Item[];
  domains: Item[];
  images: Item[];
}

export const emptyResults = {
  linodes: [], nodebalancers: [], volumes: [], domains: [], images: []
}

export const iconMap = {
  'LinodeIcon': LinodeIcon,
  'NodebalIcon': NodebalIcon,
  'VolumeIcon': VolumeIcon,
  'DomainIcon': DomainIcon,
  'default': LinodeIcon,
}

// Helper can be extended to other entities once tags are supported for them.
// @todo Inefficient to call this function twice for each search result.
export const getMatchingTags = (tags: string[], query: string): string[] => {
  return tags.filter((tag: string) =>
    tag.toLocaleLowerCase().includes(query.toLowerCase()));
}

export const filterMatched = (query: string, label: string, tags: string[]) => {
  const matchingTags = getMatchingTags(tags, query);
  const bool = or(
    label.toLowerCase().includes(query.toLowerCase()),
    matchingTags.length > 0
  )
  return bool;
}

export const searchLinodes = (
  linodes: Linode.Linode[],
  query: string,
  typesData: Linode.LinodeType[],
  images: Linode.Image[],
) => {
  let results: Item[] = [];

  for (let i = 0, len = linodes.length; i < len; i++) {
    const linode = linodes[i];
    if (filterMatched(query, linode.label, linode.tags)) {
      results = [...results, {
        label: linode.label,
        value: linode.id,
        data: {
          tags: linode.tags,
          description: getLinodeDescription(
            displayType(linode.type, typesData),
            linode.specs.memory,
            linode.specs.disk,
            linode.specs.vcpus,
            linode.image!,
            images,
          ),
          icon: 'LinodeIcon',
          path: `/linodes/${linode.id}`,
          searchText: query,
          created: linode.created,
          region: linode.region,
          status: linode.status,
        }
      }]
    }
  }

  return results;
}

export const searchVolumes = (volumes: Linode.Volume[], query: string) => {
  let results: Item[] = [];

  for (let i = 0, len = volumes.length; i < len; i++) {
    const volume = volumes[i];

    if (filterMatched(query, volume.label, volume.tags)) {
      results = [...results, {
        label: volume.label,
        value: volume.id,
        data: {
          tags: volume.tags,
          description: volume.size + ' GiB',
          icon: 'VolumeIcon',
          path: `/volumes/${volume.id}`,
          searchText: query,
          created: volume.created,
          region: volume.region,
        }
      }]
    }
  }

  return results;
}

export const searchNodeBalancers = (nodebalancers: Linode.NodeBalancer[], query: string) => {
  let results: Item[] = [];

  for (let i = 0, len = nodebalancers.length; i < len; i++) {
    const nodebalancer = nodebalancers[i];

    if (filterMatched(query, nodebalancer.label, nodebalancer.tags || [])) {
      results = [...results, {
        label: nodebalancer.label,
        value: nodebalancer.id,
        data: {
          tags: nodebalancer.tags,
          description: nodebalancer.hostname,
          icon: 'NodebalIcon',
          path: `/nodebalancers/${nodebalancer.id}`,
          searchText: query,
          created: nodebalancer.created
        }
      }]
    }
  }

  return results;
}

export const searchDomains = (domains: Linode.Domain[], query: string) => {
  let results: Item[] = [];

  for (let i = 0, len = domains.length; i < len; i++) {
    const domain = domains[i];

    if (filterMatched(query, domain.domain, domain.tags)) {
      results = [...results, {
        label: domain.domain,
        value: domain.id,
        data: {
          tags: domain.tags,
          description: domain.description || domain.status,
          icon: 'DomainIcon',
          path: `/domains/${domain.id}`,
          searchText: query,
        }
      }]
    }
  }

  return results;
}

export const searchImages = (images: Linode.Image[], query: string) => {
  let results: Item[] = [];

  for (let i = 0, len = images.length; i < len; i++) {
    const image = images[i];
    if ((image.is_public === false && image.label.toLowerCase().includes(query.toLowerCase()))) {
      results = [...results, {
        label: image.label,
        value: image.id,
        data: {
          tags: [],
          description: image.description || '',
          /* TODO: Update this with the Images icon! */
          icon: 'VolumeIcon',
          /* TODO: Choose a real location for this to link to */
          path: `/images`,
          searchText: query,
          created: image.created,
        }
      }]
    }
  }

  return results;
}

export const linodeDescription = (
  typeLabel: string,
  memory: number,
  disk: number,
  vcpus: number,
  imageId: string,
  images: Linode.Image[]
) => {
  const image = (images && images.find((img: Linode.Image) => img.id === imageId))
    || { label: 'Unknown Image' };
  const imageDesc = image.label;
  const typeDesc = typeLabelLong(typeLabel, memory, disk, vcpus);
  return `${imageDesc}, ${typeDesc}`;
}

export const searchAll = (
  linodes: Linode.Linode[],
  volumes: Linode.Volume[],
  nodeBalancers: Linode.NodeBalancer[],
  domains: Linode.Domain[],
  images: Linode.Image[],
  query: string,
  typesData: Linode.LinodeType[] = [],
) => {
  try {
    return {
      domains: searchDomains(domains, query),
      images: searchImages(images, query),
      linodes: searchLinodes(linodes, query, typesData, images),
      nodebalancers: searchNodeBalancers(nodeBalancers, query),
      volumes: searchVolumes(volumes, query),
    };
  } catch (error) {
    reportException(error);
    return {
      domains: [],
      images: [],
      linodes: [],
      nodebalancers: [],
      volumes: [],
    };
  }
};
