import { Image, Volume } from '@linode/api-v4';
import { Domain } from '@linode/api-v4/lib/domains';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { connect, useSelector } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';
import { listToItemsByID } from 'src/queries/base';
import { ApplicationState } from 'src/store';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import entitiesErrors, {
  ErrorObject,
} from 'src/store/selectors/entitiesErrors';
import entitiesLoading from 'src/store/selectors/entitiesLoading';
import getSearchEntities, {
  bucketToSearchableItem,
  domainToSearchableItem,
  formatLinode,
  imageToSearchableItem,
  volumeToSearchableItem,
} from 'src/store/selectors/getSearchEntities';
import { refinedSearch } from './refinedSearch';
import {
  SearchableItem,
  SearchResults,
  SearchResultsByEntity,
} from './search.interfaces';
import { emptyResults, separateResultsByEntity } from './utils';

interface HandlerProps {
  search: (
    query: string,
    buckets: ObjectStorageBucket[],
    domains: Domain[],
    volumes: Volume[],
    images: Image[]
  ) => SearchResults;
}
export interface SearchProps extends HandlerProps {
  combinedResults: SearchableItem[];
  entities: SearchableItem[];
  entitiesLoading: boolean;
  searchResultsByEntity: SearchResultsByEntity;
  errors: ErrorObject;
}

export const search = (
  entities: SearchableItem[],
  inputValue: string
): SearchResults => {
  if (!inputValue || inputValue === '') {
    return { searchResultsByEntity: emptyResults, combinedResults: [] };
  }

  const combinedResults = refinedSearch(inputValue, entities);

  return {
    combinedResults,
    searchResultsByEntity: separateResultsByEntity(combinedResults),
  };
};

export default () => (Component: React.ComponentType<any>) => {
  const WrappedComponent: React.FC<SearchProps> = (props) => {
    return React.createElement(Component, {
      ...props,
    });
  };

  const connected = connect((state: ApplicationState) => {
    return {
      linodes: useSelector((state: ApplicationState) =>
        Object.values(state.__resources.linodes.itemsById)
      ),
      types: useSelector(
        (state: ApplicationState) => state.__resources.types.entities
      ),
      entities: getSearchEntities(state.__resources),
      entitiesLoading: entitiesLoading(state.__resources),
      errors: entitiesErrors(state.__resources),
    };
  });

  return compose<SearchProps, {}>(
    connected,
    withStateHandlers<any, any, any>(
      { searchResultsByEntity: emptyResults },
      {
        search: (_, props: SearchProps) => (
          query: string,
          linodes: LinodeWithMaintenanceAndDisplayStatus[],
          types: ExtendedType[],
          objectStorageBuckets: ObjectStorageBucket[],
          domains: Domain[],
          volumes: Volume[],
          images: Image[]
        ) => {
          const searchableBuckets = objectStorageBuckets.map((bucket) =>
            bucketToSearchableItem(bucket)
          );
          const searchableDomains = domains.map((domain) =>
            domainToSearchableItem(domain)
          );
          const searchableVolumes = volumes.map((volume) =>
            volumeToSearchableItem(volume)
          );
          const searchableImages = images.map((image) =>
            imageToSearchableItem(image)
          );

          const searchableLinodes = linodes.map((linode) =>
            formatLinode(linode, types, listToItemsByID(images))
          );

          const results = search(
            [
              ...props.entities,
              ...searchableLinodes,
              ...searchableBuckets,
              ...searchableDomains,
              ...searchableVolumes,
              ...searchableImages,
            ],
            query
          );
          const { searchResultsByEntity, combinedResults } = results;
          return {
            searchResultsByEntity,
            combinedResults,
          };
        },
      }
    )
  )(WrappedComponent);
};
