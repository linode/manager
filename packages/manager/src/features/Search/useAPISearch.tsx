import { flatten } from 'ramda';
import { useCallback } from 'react';
import { getDomains } from '@linode/api-v4/lib/domains';
import { getImages, Image } from '@linode/api-v4/lib/images';
import { getLinodes, LinodeType } from '@linode/api-v4/lib/linodes';
import { getKubernetesClusters } from '@linode/api-v4/lib/kubernetes';
import { getNodeBalancers } from '@linode/api-v4/lib/nodebalancers';
import { getVolumes } from '@linode/api-v4/lib/volumes';
import { refinedSearch } from './refinedSearch';
import { SearchableItem, SearchResults } from './search.interfaces';
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
  searchAPI: (query: string) => Promise<SearchResults>;
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

const generateFilter = (text: string, labelFieldName: string = 'label') => {
  return {
    '+or': [
      {
        [labelFieldName]: { '+contains': text }
      },
      {
        tags: { '+contains': text }
      }
    ]
  };
};

const requestEntities = (
  searchText: string,
  types: LinodeType[],
  images: Record<string, Image>
) => {
  return Promise.all([
    getDomains({}, generateFilter(searchText, 'domain')).then(results =>
      results.data.map(domainToSearchableItem)
    ),
    getLinodes({}, generateFilter(searchText)).then(results =>
      results.data.map(thisResult => formatLinode(thisResult, types, images))
    ),
    getImages(
      {},
      // Images can't be tagged and we have to filter only private Images
      // Use custom filters for this
      {
        '+and': [{ label: { '+contains': searchText } }, { is_public: false }]
      }
    ).then(results => results.data.map(imageToSearchableItem)),
    getVolumes({}, generateFilter(searchText)).then(results =>
      results.data.map(volumeToSearchableItem)
    ),
    getNodeBalancers({}, generateFilter(searchText)).then(results =>
      results.data.map(nodeBalToSearchableItem)
    ),
    getKubernetesClusters().then(results =>
      // Can't filter LKE by label (or anything maybe?)
      // But no one has more than 500, so this is fine for the short term.
      // @todo replace with generateFilter() when LKE-1889 is complete
      results.data.map(kubernetesClusterToSearchableItem)
    )
  ]).then(results => (flatten(results) as unknown) as SearchableItem[]);
};

export default useAPISearch;
