import { getDomains } from '@linode/api-v4/lib/domains';
import { getImages, Image } from '@linode/api-v4/lib/images';
import { getKubernetesClusters } from '@linode/api-v4/lib/kubernetes';
import { getLinodes, LinodeType } from '@linode/api-v4/lib/linodes';
import { getNodeBalancers } from '@linode/api-v4/lib/nodebalancers';
import { getVolumes } from '@linode/api-v4/lib/volumes';
import { flatten } from 'ramda';
import React from 'react';
import { useCallback } from 'react';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { listToItemsByID } from 'src/queries/base';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllTypes, useSpecificTypes } from 'src/queries/types';
import {
  domainToSearchableItem,
  formatLinode,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
  nodeBalToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';
import cleanArray from 'src/utilities/cleanArray';
import { refinedSearch } from './refinedSearch';
import { SearchableItem, SearchResults } from './search.interfaces';
import { emptyResults, separateResultsByEntity } from './utils';

interface Search {
  searchAPI: (query: string) => Promise<SearchResults>;
}

export const useAPISearch = (conductedSearch: boolean): Search => {
  const { _isRestrictedUser } = useAccountManagement();
  const { data: _images } = useAllImagesQuery({}, {}, conductedSearch);
  const { data: allTypes } = useAllTypes();

  // Some types may not be returned by the hook above
  const [requestedTypes, setRequestedTypes] = React.useState<string[]>([]);
  const typesQuery = useSpecificTypes(requestedTypes);
  const additionalTypes = cleanArray(typesQuery.map((result) => result.data));

  const types = [...(allTypes ?? []), ...additionalTypes];

  const images = listToItemsByID(_images ?? []);

  const searchAPI = useCallback(
    (searchText: string) => {
      if (!searchText || searchText === '') {
        return Promise.resolve({
          searchResultsByEntity: emptyResults,
          combinedResults: [],
        });
      }

      return requestEntities(
        searchText,
        types ?? [],
        images,
        setRequestedTypes,
        _isRestrictedUser
      ).then((results) => {
        const combinedResults = refinedSearch(searchText, results);
        return {
          combinedResults,
          searchResultsByEntity: separateResultsByEntity(combinedResults),
        };
      });
    },
    [_isRestrictedUser, images, types]
  );

  return { searchAPI };
};

const generateFilter = (
  text: string,
  labelFieldName: string = 'label',
  filterByIp?: boolean
) => {
  return {
    '+or': [
      {
        [labelFieldName]: { '+contains': text },
      },
      {
        tags: { '+contains': text },
      },
      ...(filterByIp
        ? [
            {
              ipv4: { '+contains': text },
            },
          ]
        : []),
    ],
  };
};

const params = { page_size: API_MAX_PAGE_SIZE };

const requestEntities = (
  searchText: string,
  types: LinodeType[],
  images: Record<string, Image>,
  setRequestedTypes: (types: string[]) => void,
  isRestricted: boolean = false
) => {
  return Promise.all([
    getDomains(params, generateFilter(searchText, 'domain')).then((results) =>
      results.data.map(domainToSearchableItem)
    ),
    getLinodes(params, generateFilter(searchText, 'label', true)).then(
      (results) => {
        setRequestedTypes(
          cleanArray(results.data.map((result) => result.type))
        );
        return results.data.map((thisResult) =>
          formatLinode(thisResult, types, images)
        );
      }
    ),
    getImages(
      params,
      // Images can't be tagged and we have to filter only private Images
      // Use custom filters for this
      {
        '+and': [{ label: { '+contains': searchText } }, { is_public: false }],
      }
    ).then((results) => results.data.map(imageToSearchableItem)),
    getVolumes(params, generateFilter(searchText)).then((results) =>
      results.data.map(volumeToSearchableItem)
    ),
    getNodeBalancers(
      params,
      generateFilter(searchText, 'label', true)
    ).then((results) => results.data.map(nodeBalToSearchableItem)),
    // Restricted users always get a 403 when requesting clusters
    !isRestricted
      ? getKubernetesClusters().then((results) =>
          // Can't filter LKE by label (or anything maybe?)
          // But no one has more than 500, so this is fine for the short term.
          // @todo replace with generateFilter() when LKE-1889 is complete
          results.data.map(kubernetesClusterToSearchableItem)
        )
      : Promise.resolve([]),
    // API filtering on Object Storage buckets does not work.
  ]).then((results) => (flatten(results) as unknown) as SearchableItem[]);
};

export default useAPISearch;
