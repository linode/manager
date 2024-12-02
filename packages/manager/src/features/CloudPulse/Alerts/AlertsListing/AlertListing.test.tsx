import * as React from 'react';

import { alertFactory } from 'src/factories/cloudpulse/alerts';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertListing } from './AlertListing';

const queryMocks = vi.hoisted(() => ({
  useAllAlertDefinitionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useAllAlertDefinitionsQuery: queryMocks.useAllAlertDefinitionsQuery,
  };
});

const mockResponse = alertFactory.buildList(3);

describe('Alert Listing', () => {
  it('should render the error message', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: undefined,
      error: 'an error happened',
      isError: true,
      isLoading: false,
    });
    const { getAllByText } = renderWithTheme(<AlertListing />);
    getAllByText('Error in fetching the alerts.');
  });

  it('should render the alert landing table with items', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getAllByText } = renderWithTheme(<AlertListing />);
    getAllByText('Alert Name');
    getAllByText('Service Type');
    getAllByText('Severity');
    getAllByText('Status');
    getAllByText('Last Modified');
    getAllByText('Created By');
  });
});
