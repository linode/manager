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
import { refinedSearch, SearchableItem } from 'src/utilities/refinedSearch';

interface HandlerProps {
  search: (query: string) => SearchResults;
}
export interface SearchProps extends HandlerProps {
  combinedResults: Item[];
  entities: SearchableItem[];
  entitiesLoading: boolean;
  searchResults: SearchResults;
  errors: ErrorObject;
}

export const search = (
  entities: SearchableItem[],
  inputValue: string
): SearchResults => {
  if (!inputValue || inputValue === '') {
    return emptyResults;
  }

  const results = refinedSearch(inputValue, entities);
  const resultsSeparatedByEntity = separateResultsByEntity(results);

  return resultsSeparatedByEntity;
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
): SearchResults => {
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

const separateResultsByEntity = (searchResults: SearchableItem[]) => {
  const separatedResults = {
    linodes: [],
    volumes: [],
    domains: [],
    images: [],
    nodebalancers: []
  };

  searchResults.forEach(result => {
    // EntityTypes are singular; we'd like the resulting array to be plural
    const pluralizedEntityType = result.entityType + 's';
    separatedResults[pluralizedEntityType].push(result);
  });
  return separatedResults;
};
