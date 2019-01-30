import * as React from 'react';
import { connect } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';
import { Item } from 'src/components/EnhancedSelect/Select';
import { emptyResults, filterMatched } from 'src/features/Search/utils';
import { ApplicationState } from 'src/store';
import entitiesErrors, {
  ErrorObject
} from 'src/store/selectors/entitiesErrors';
import entitiesLoading from 'src/store/selectors/entitiesLoading';
import getSearchEntities, {
  SearchResults
} from 'src/store/selectors/getSearchEntities';

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
  return {
    linodes: linodes.filter(linode =>
      filterMatched(inputValue, linode.label, linode.data.tags)
    ),
    volumes: volumes.filter(volume =>
      filterMatched(inputValue, volume.label, volume.data.tags)
    ),
    domains: domains.filter(domain =>
      filterMatched(inputValue, domain.label, domain.data.tags)
    ),
    images: images.filter(image =>
      filterMatched(inputValue, image.label, image.data.tags)
    ),
    nodebalancers: nodebalancers.filter(nodebal =>
      filterMatched(inputValue, nodebal.label, nodebal.data.tags)
    )
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
const combineResults = (results: SearchResults, query: string): Item[] => {
  return Object.values(results).reduce(
    (accumulator, entityResultList: Item[]) => [
      ...accumulator,
      ...entityResultList.map(entity => ({
        ...entity,
        data: { ...entity.data, searchText: query }
      }))
    ],
    []
  );
};
