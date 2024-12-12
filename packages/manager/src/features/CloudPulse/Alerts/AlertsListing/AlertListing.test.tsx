import userEvent from '@testing-library/user-event';
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
  it('should render the error message', () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: undefined,
      error: 'an error happened',
      isError: true,
      isLoading: false,
    });
    const { getAllByText } = renderWithTheme(<AlertListing />);
    getAllByText('Error in fetching the alerts.');
  });

  it('should render the alert landing table with items', () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getAllByLabelText, getByText } = renderWithTheme(<AlertListing />);
    expect(getByText('Alert Name')).toBeInTheDocument();
    expect(getByText('Service')).toBeInTheDocument();
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByText('Last Modified')).toBeInTheDocument();
    expect(getByText('Created By')).toBeInTheDocument();
    expect(getAllByLabelText('Action menu for Alert').length).toBe(3);
  });

  it('should render the alert row', () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });

    const { getByText } = renderWithTheme(<AlertListing />);
    expect(getByText(mockResponse[0].label)).toBeInTheDocument();
    expect(getByText(mockResponse[1].label)).toBeInTheDocument();
    expect(getByText(mockResponse[2].label)).toBeInTheDocument();
  });

  it('should have the show details action item present inside action menu', async () => {
    queryMocks.useAllAlertDefinitionsQuery.mockReturnValue({
      data: mockResponse,
      isError: false,
      isLoading: false,
      status: 'success',
    });
    const { getAllByLabelText, getByTestId } = renderWithTheme(
      <AlertListing />
    );
    const firstActionMenu = getAllByLabelText('Action menu for Alert')[0];
    await userEvent.click(firstActionMenu);
    expect(getByTestId('Show Details')).toBeInTheDocument();
  });
});
