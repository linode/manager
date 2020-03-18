/*
 * IMPORTANT NOTE:
 * These tests have been skipped for now to address a cyclic dependency issue. Once services/linodes and
 * services/domains no longer require src/store, we should restore these tests.
 */

import { cleanup, render } from '@testing-library/react';
import { assocPath } from 'ramda';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { CombinedProps as Props, SearchLanding } from './SearchLanding';
import { emptyResults } from './utils';

const props: Props = {
  entities: [],
  entitiesLoading: false,
  searchResultsByEntity: emptyResults,
  combinedResults: [],
  search: jest.fn(),
  errors: {
    hasErrors: false,
    linodes: false,
    domains: false,
    nodebalancers: false,
    images: false,
    volumes: false
  },
  ...reactRouterProps
};

const propsWithResults: Props = {
  ...props,
  combinedResults: [searchbarResult1],
  searchResultsByEntity: { ...emptyResults, linodes: [searchbarResult1] }
};

jest.mock('linode-js-sdk');
jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: () => jest.fn().mockReturnValue({ _loading: false })
}));

afterEach(cleanup);

describe('Component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<SearchLanding {...props} />);
    expect(getByText(/search/));
  });

  it('should search on mount', () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=search',
      propsWithResults
    );
    const { getByText } = renderWithTheme(<SearchLanding {...newProps} />);
    getByText(/search/i);
    expect(props.search).toHaveBeenCalledWith('search');
  });

  it('should search when the entity list (from Redux) changes', () => {
    jest.resetAllMocks();
    const { rerender } = render(wrapWithTheme(<SearchLanding {...props} />));
    expect(props.search).toHaveBeenCalledTimes(1);

    const newEntities = [searchbarResult1];
    rerender(
      wrapWithTheme(<SearchLanding {...props} entities={newEntities} />)
    );
    expect(props.search).toHaveBeenCalledTimes(2);
  });

  it('should show an empty state', () => {
    const { getByText } = renderWithTheme(<SearchLanding {...props} />);
    getByText(/no results/i);
  });

  it('should display the query term', () => {
    const { getByText } = renderWithTheme(
      <SearchLanding {...propsWithResults} />
    );
    getByText('Search Results for "search"');
  });

  it('should parse multi-word queries correctly', () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=two%20words',
      propsWithResults
    );
    const { getByText } = renderWithTheme(<SearchLanding {...newProps} />);
    expect(getByText('Search Results for "two words"'));
  });

  it('should handle blank or unusual queries without crashing', () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=',
      propsWithResults
    );
    const { getByText } = renderWithTheme(<SearchLanding {...newProps} />);
    getByText(/search/i);
  });
});
