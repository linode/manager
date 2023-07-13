import * as React from 'react';
import RouteLanding from './RouteLanding';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { getRouteFactory } from 'src/factories/aglb';

const routes = getRouteFactory.buildList(4);
let isLoading = false;
let error = false;

// Mock the useRoutesQuery hook to return routes data
jest.mock('src/queries/aglb/routes', () => ({
  useRoutesQuery: () => ({
    data: {
      data: routes,
    },
    error,
    isLoading,
  }),
}));

describe('Domains Landing', () => {
  it('should initially render a loading state', () => {
    isLoading = true;

    const { getByTestId } = renderWithTheme(<RouteLanding />);
    expect(getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('should render an error state', () => {
    isLoading = false;
    error = true;

    const { getByText } = renderWithTheme(<RouteLanding />);
    expect(
      getByText(
        'There was an error retrieving your domains. Please reload and try again.'
      )
    ).toBeInTheDocument();
  });

  it('should render a table of routes', () => {
    isLoading = false;
    error = false;

    const { getByTestId } = renderWithTheme(<RouteLanding />);
    expect(getByTestId('aglb-route-landing-table')).toBeInTheDocument();
  });

  it('should render a table with the correct number of rows', () => {
    isLoading = false;
    error = false;

    const { getAllByTestId } = renderWithTheme(<RouteLanding />);
    expect(getAllByTestId('aglb-route-landing-table-row')).toHaveLength(
      routes.length
    );
  });

  it('should render a table with the correct number of columns', () => {
    isLoading = false;
    error = false;

    const { getAllByTestId } = renderWithTheme(<RouteLanding />);
    expect(
      getAllByTestId('aglb-route-landing-table-row')[0].children
    ).toHaveLength(4);
  });
});
