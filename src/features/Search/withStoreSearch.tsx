import * as React from 'react';
import { connect } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';
import { Item } from 'src/components/EnhancedSelect/Select';
import { emptyResults } from 'src/features/Search/utils';
import { ApplicationState } from 'src/store';
import entitiesErrors, {
  ErrorObject
} from 'src/store/selectors/entitiesErrors';
import entitiesLoading from 'src/store/selectors/entitiesLoading';
import getSearchEntities, {
  SearchResults
} from 'src/store/selectors/getSearchEntities';
import {
  refinedSearch,
  SearchableEntityType,
  SearchableItem
} from 'src/utilities/refinedSearch';

interface HandlerProps {
  search: (query: string) => SearchResults;
}
export interface SearchProps extends HandlerProps {
  combinedResults: Item[];
  entities: SearchResults;
  entitiesLoading: boolean;
  searchResults: SearchResults;
  errors: ErrorObject;
}

export const search = (
  entities: SearchResults,
  inputValue: string
): SearchResults => {
  if (!inputValue || inputValue === '') {
    return entities; // could also return empty results, but this matches existing pattern.
  }
  const { linodes, volumes, domains, nodebalancers, images } = entities;

  // Flatten all entities so we can search a single array. We add "entityType" to each item.
  const entitiesToSearch = [
    ...addEntityTypeToItems('linode', linodes),
    ...addEntityTypeToItems('volume', volumes),
    ...addEntityTypeToItems('domain', domains),
    ...addEntityTypeToItems('nodebalancer', nodebalancers),
    ...addEntityTypeToItems('image', images)
  ];

  const results = refinedSearch(inputValue, entitiesToSearch);

  return {
    linodes: filterFor('linode', results),
    volumes: filterFor('volume', results),
    domains: filterFor('domain', results),
    images: filterFor('image', results),
    nodebalancers: filterFor('nodebalancer', results)
  };
};

export default () => (Component: React.ComponentType<any>) => {
  const WrappedComponent: React.StatelessComponent<SearchProps> = props => {
    return React.createElement(Component, {
      ...props
    });
  };

  const connected = connect((state: ApplicationState) => {
    return {
      entities: getSearchEntities(state.__resources),
      entitiesLoading: entitiesLoading(state.__resources),
      errors: entitiesErrors(state.__resources)
    };
  });

  return compose<SearchProps, {}>(
    connected,
    withStateHandlers<any, any, any>(
      { searchResults: emptyResults },
      {
        search: (_, props: SearchProps) => (query: string) => {
          const searchResults = search(props.entities, query);
          return {
            searchResults,
            combinedResults: combineResults(searchResults, query)
          };
        }
      }
    )
  )(WrappedComponent);
};

/** Flatten results into a single array, and include the query string in each
 * result object. This is the format needed for the search bar, which does not
 * separate results by entity type, and highlights the search match.
 */
const combineResults = (
  results: SearchResults,
  query: string
): SearchableItem[] => {
  return Object.values(results).reduce(
    (accumulator, entityResultList: SearchableItem[]) => [
      ...accumulator,
      ...entityResultList.map(entity => ({
        ...entity,
        data: { ...entity.data, searchText: query }
      }))
    ],
    []
  );
};

// Walks though an Items array and adds the specified entity type to the `data` field.
// This is to allow queries like "type:linode".
const addEntityTypeToItems = (
  entityType: SearchableEntityType,
  items: Item[]
): SearchableItem[] =>
  items.map(item => ({
    ...item,
    entityType
  }));

// Filters given results, including only the specified entity type
const filterFor = (
  entityType: SearchableEntityType,
  searchResults: SearchableItem[]
) => {
  return searchResults.filter(result => result.entityType === entityType);
};
