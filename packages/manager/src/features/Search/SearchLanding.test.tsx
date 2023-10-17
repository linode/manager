import { render, waitForElementToBeRemoved } from '@testing-library/react';
import { assocPath } from 'ramda';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { searchbarResult1 } from 'src/__data__/searchResults';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';
import { linodeTypeFactory } from 'src/factories';

import { CombinedProps as Props, SearchLanding } from './SearchLanding';
import { emptyResults } from './utils';

const props: Props = {
  combinedResults: [],
  entities: [],
  entitiesLoading: false,
  search: jest.fn(),
  searchResultsByEntity: emptyResults,
  ...reactRouterProps,
};

const propsWithResults: Props = {
  ...props,
  combinedResults: [searchbarResult1],
  searchResultsByEntity: { ...emptyResults, linodes: [searchbarResult1] },
};

const queryClient = new QueryClient();

describe('Component', () => {
  beforeEach(() => {
    server.use(
      rest.get('*/domains', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage([])));
      }),
      rest.get('*/linode/types/*', (req, res, ctx) => {
        return res(ctx.json(linodeTypeFactory.build()));
      })
    );
  });

  it('should render', async () => {
    const { findByText } = renderWithTheme(<SearchLanding {...props} />);
    expect(await findByText(/search/));
  });

  it('should search on mount', async () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=search',
      propsWithResults
    );
    const { getByTestId, getByText } = renderWithTheme(
      <SearchLanding {...newProps} />,
      { queryClient }
    );
    await waitForElementToBeRemoved(getByTestId('loading'));
    getByText(/search/i);
    expect(props.search).toHaveBeenCalled();
  });

  it('should search when the entity list (from Redux) changes', () => {
    jest.clearAllMocks();
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
