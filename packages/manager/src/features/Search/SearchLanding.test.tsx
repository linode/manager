import { render } from '@testing-library/react';
import { assocPath } from 'ramda';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { linodeTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import { SearchLanding } from './SearchLanding';
import { emptyResults } from './utils';

import type { SearchLandingProps as Props } from './SearchLanding';

const props: Props = {
  combinedResults: [],
  entities: [],
  entitiesLoading: false,
  search: vi.fn(),
  searchResultsByEntity: emptyResults,
  ...reactRouterProps,
};

const propsWithResults: Props = {
  ...props,
  combinedResults: [searchbarResult1],
  searchResultsByEntity: { ...emptyResults, linodes: [searchbarResult1] },
};

describe('Component', () => {
  beforeEach(() => {
    server.use(
      http.get('*/domains', () => {
        return HttpResponse.json(makeResourcePage([]));
      }),
      http.get('*/linode/types/*', () => {
        return HttpResponse.json(linodeTypeFactory.build());
      })
    );
  });

  it('should render', async () => {
    const { findByText } = renderWithTheme(<SearchLanding {...props} />);
    expect(await findByText(/searched/i));
  });

  it('should search on mount', async () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=search',
      propsWithResults
    );
    const { getByText } = renderWithTheme(<SearchLanding {...newProps} />);
    getByText(/search/i);
    expect(props.search).toHaveBeenCalled();
  });

  it('should search when the entity list (from Redux) changes', () => {
    vi.clearAllMocks();
    const { rerender } = render(wrapWithTheme(<SearchLanding {...props} />));
    expect(props.search).toHaveBeenCalledTimes(1);

    const newEntities = [searchbarResult1];
    rerender(
      wrapWithTheme(<SearchLanding {...props} entities={newEntities} />)
    );
    expect(props.search).toHaveBeenCalledTimes(2);
  });

  it('should show an empty state', async () => {
    const { findByText } = renderWithTheme(<SearchLanding {...props} />);
    await findByText(/no results/i);
  });

  it('should display the query term', async () => {
    const { findByText } = renderWithTheme(
      <SearchLanding {...propsWithResults} />
    );
    await findByText('Search Results for "search"');
  });

  it('should parse multi-word queries correctly', async () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=two%20words',
      propsWithResults
    );
    const { findByText } = renderWithTheme(<SearchLanding {...newProps} />);
    expect(await findByText('Search Results for "two words"'));
  });

  it('should handle blank or unusual queries without crashing', async () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=',
      propsWithResults
    );
    const { findByText } = renderWithTheme(<SearchLanding {...newProps} />);
    await findByText(/search/i);
  });
});
