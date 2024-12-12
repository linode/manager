import React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertDetail } from './AlertDetail';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
}));

// Shared Setup
beforeEach(() => {
  queryMocks.useAlertDefinitionQuery.mockReturnValue({
    data: alertDetails,
    isError: false,
    isFetching: false,
  });
});

describe('AlertDetail component tests', () => {
  it('should render the error state on details API call failure', () => {
    // return isError true
    queryMocks.useAlertDefinitionQuery.mockReturnValueOnce({
      data: null,
      isError: true,
      isFetching: false,
    });

    const { getByTestId, getByText } = renderWithTheme(<AlertDetail />);

    // Assert error message is displayed
    expect(
      getByText(
        'An error occurred while loading the definitions. Please try again later.'
      )
    ).toBeInTheDocument();

    // validate breadcrumbs on error state
    const link = getByTestId('link-text');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Definitions');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/monitor/alerts/definitions'
    );
  });

  it('should render the loading state when API call is fetching', () => {
    // return isFetching true
    queryMocks.useAlertDefinitionQuery.mockReturnValueOnce({
      data: null,
      isError: false,
      isFetching: true,
    });

    const { getByTestId } = renderWithTheme(<AlertDetail />);

    expect(getByTestId('circle-progress')).toBeInTheDocument();

    // validate breadcrumbs on loading state
    const link = getByTestId('link-text');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Definitions');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/monitor/alerts/definitions'
    );
  });
});
