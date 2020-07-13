import { flatten } from 'ramda';
import { useCallback } from 'react';
import { getDomains } from '@linode/api-v4/lib/domains';
import { getImages } from '@linode/api-v4/lib/images';
import { getLinodes } from '@linode/api-v4/lib/linodes';
import { getKubernetesClusters } from '@linode/api-v4/lib/kubernetes';
import { getNodeBalancers } from '@linode/api-v4/lib/nodebalancers';
import { getVolumes } from '@linode/api-v4/lib/volumes';
import { refinedSearch } from './refinedSearch';
import { SearchableItem } from './search.interfaces';
import { useTypes } from 'src/hooks/useTypes';
import { useImages } from 'src/hooks/useImages';
import {
  domainToSearchableItem,
  formatLinode,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  nodeBalToSearchableItem,
  volumeToSearchableItem
} from 'src/store/selectors/getSearchEntities';

import { emptyResults, separateResultsByEntity } from './utils';

interface Search {
  searchAPI: (query: string) => Promise<any>; // Promise<SearchResults>;
}

export const useAPISearch = (): Search => {
  const { images } = useImages('public');
  const { types } = useTypes();
  const searchAPI = useCallback(
    (searchText: string) => {
      if (!searchText || searchText === '') {
        return Promise.resolve({
          searchResultsByEntity: emptyResults,
          combinedResults: []
        });
      }

      return requestEntities(searchText, types.entities, images.itemsById).then(
        results => {
          const combinedResults = refinedSearch(searchText, results);
          return {
            combinedResults,
            searchResultsByEntity: separateResultsByEntity(combinedResults)
          };
        }
      );
    },
    [images.itemsById, types.entities]
  );

  return { searchAPI };
};

const requestEntities = (searchText: string, types: any, images: any) => {
  return Promise.all([
    getDomains({}, { domain: { '+contains': searchText } }).then(results =>
      results.data.map(domainToSearchableItem)
    ),
    getLinodes({}, { label: { '+contains': searchText } }).then(results =>
      results.data.map(thisResult => formatLinode(thisResult, types, images))
    ),
    getImages(
      {},
      {
        '+and': [{ label: { '+contains': searchText } }, { is_public: false }]
      }
    ).then(results => results.data.map(imageToSearchableItem)),
    getVolumes({}, { label: { '+contains': searchText } }).then(results =>
      results.data.map(volumeToSearchableItem)
    ),
    getNodeBalancers({}, { label: { '+contains': searchText } }).then(results =>
      results.data.map(nodeBalToSearchableItem)
    ),
    getKubernetesClusters().then(results =>
      // Can't filter LKE by label (or anything maybe?)
      // But no one has more than 500, so this is fine for the short term.
      results.data.map(kubernetesClusterToSearchableItem)
    )
  ]).then(results => (flatten(results) as unknown) as SearchableItem[]);
};

export default useAPISearch;
