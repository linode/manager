import * as React from 'react';
import { connect } from 'react-redux';
import { compose, withStateHandlers } from 'recompose';

import { emptyResults, filterMatched } from 'src/features/Search/utils';
import entitiesLoading from 'src/store/selectors/entitiesLoading';
import getSearchEntities, { SearchResults } from 'src/store/selectors/getSearchEntities';


interface HandlerProps {
  search: (query: string) => SearchResults;
}
export interface SearchProps extends HandlerProps {
  entities: SearchResults;
  entitiesLoading: boolean;
  searchResults: SearchResults;
}

export const search = (entities: SearchResults, inputValue:string ): SearchResults => {
  if (!inputValue || inputValue === '') {
    return entities; // could also return empty results, but this matches existing pattern.
  }
  const {
    linodes,
    volumes,
    domains,
    nodebalancers,
    images
  } = entities;
  return {
    linodes: linodes.filter((linode) => filterMatched(inputValue, linode.label, linode.data.tags)),
    volumes: volumes.filter((volume) => filterMatched(inputValue, volume.label, volume.data.tags)),
    domains: domains.filter((domain) => filterMatched(inputValue, domain.label, domain.data.tags)),
    images: images.filter((image) => filterMatched(inputValue, image.label, image.data.tags)),
    nodebalancers: nodebalancers.filter((nodebal) => filterMatched(inputValue, nodebal.label, nodebal.data.tags)),
  }
}

export default () => (Component: React.ComponentType<any>) => {
  const WrappedComponent: React.StatelessComponent<SearchProps> = (props) => {
      return React.createElement(Component, {
        ...props,
      });
    }

  const connected = connect(
    (state: ApplicationState) => {
      return {
        entities: getSearchEntities(state.__resources),
        entitiesLoading: entitiesLoading(state.__resources)
      }
    }
  );

  return compose<SearchProps, {}>(
    connected,
    withStateHandlers<any, any, any>({ searchResults: emptyResults },
      {
        search: (_, props: SearchProps) => (query: string) => ({ searchResults: search(props.entities, query)  })
      })
  )(WrappedComponent);
}