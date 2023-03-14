import { Image, KubernetesCluster, Region, Volume } from '@linode/api-v4';
import { Domain } from '@linode/api-v4/lib/domains';
import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';
import { ApplicationState } from 'src/store';
import entitiesErrors, {
  ErrorObject,
} from 'src/store/selectors/entitiesErrors';
import entitiesLoading from 'src/store/selectors/entitiesLoading';
import getSearchEntities, {
  bucketToSearchableItem,
  domainToSearchableItem,
  imageToSearchableItem,
  kubernetesClusterToSearchableItem,
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
    clusters: KubernetesCluster[],
    images: Image[],
    regions: Region[],
    searchableLinodes: SearchableItem<string | number>[]
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
          objectStorageBuckets: ObjectStorageBucket[],
          domains: Domain[],
          volumes: Volume[],
          clusters: KubernetesCluster[],
          images: Image[],
          regions: Region[],
          searchableLinodes: SearchableItem<string | number>[]
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

          const searchableClusters = clusters.map((cluster) =>
            kubernetesClusterToSearchableItem(cluster, regions)
          );
          const results = search(
            [
              ...searchableLinodes,
              ...searchableImages,
              ...props.entities,
              ...searchableBuckets,
              ...searchableDomains,
              ...searchableVolumes,
              ...searchableClusters,
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
