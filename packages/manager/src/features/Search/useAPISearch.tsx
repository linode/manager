import { useCallback } from 'react';
import { getDomains } from '@linode/api-v4/lib/domains';
import { refinedSearch } from './refinedSearch';
// import {
//   SearchableItem,
//   SearchResults,
//   SearchResultsByEntity
// } from './search.interfaces';
import { domainToSearchableItem } from 'src/store/selectors/getSearchEntities';

import { emptyResults, separateResultsByEntity } from './utils';

interface Search {
  searchAPI: (query: string) => Promise<any>; // Promise<SearchResults>;
}

export const useAPISearch = (): Search => {
  const searchAPI = useCallback((searchText: string) => {
    if (!searchText || searchText === '') {
      return Promise.resolve({
        searchResultsByEntity: emptyResults,
        combinedResults: []
      });
    }

    return requestEntities(searchText).then(results => {
      console.log(results);
      const combinedResults = refinedSearch(searchText, []);
      return {
        combinedResults,
        searchResultsByEntity: separateResultsByEntity(combinedResults)
      };
    });
  }, []);
  return { searchAPI };
};

const requestEntities = (searchText: string) => {
  console.log('searching');
  return Promise.all([
    getDomains({}, { domain: { '+contains': searchText } }).then(results =>
      results.data.map(domainToSearchableItem)
    )
  ]);
};

export default useAPISearch;
