import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import { SearchableItem } from 'src/utilities/refinedSearch';

export interface SearchResults {
  combinedResults: SearchableItem[];
  searchResultsByEntity: SearchResultsByEntity;
}

export interface SearchResultsByEntity {
  linodes: SearchableItem[];
  volumes: SearchableItem[];
  nodebalancers: SearchableItem[];
  domains: SearchableItem[];
  images: SearchableItem[];
}

export const emptyResults: SearchResultsByEntity = {
  linodes: [],
  nodebalancers: [],
  volumes: [],
  domains: [],
  images: []
};

export const iconMap = {
  LinodeIcon,
  NodebalIcon,
  VolumeIcon,
  DomainIcon,
  default: LinodeIcon
};

export const separateResultsByEntity = (
  searchResults: SearchableItem[]
): SearchResultsByEntity => {
  const separatedResults: SearchResultsByEntity = {
    linodes: [],
    volumes: [],
    domains: [],
    images: [],
    nodebalancers: []
  };

  searchResults.forEach(result => {
    // EntityTypes are singular; we'd like the resulting keys to be plural
    const pluralizedEntityType = result.entityType + 's';
    separatedResults[pluralizedEntityType].push(result);
  });
  return separatedResults;
};
