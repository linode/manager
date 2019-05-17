import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import NodebalIcon from 'src/assets/addnewmenu/nodebalancer.svg';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import { SearchableItem, SearchResultsByEntity } from './search.interfaces';

export const iconMap = {
  LinodeIcon,
  NodebalIcon,
  VolumeIcon,
  DomainIcon,
  default: LinodeIcon
};

export const emptyResults: SearchResultsByEntity = {
  linodes: [],
  volumes: [],
  domains: [],
  images: [],
  nodebalancers: []
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
