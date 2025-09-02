import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { destinationFactory } from 'src/factories/delivery';
import { DestinationsLanding } from 'src/features/Delivery/Destinations/DestinationsLanding';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useAllDestinationsQuery: vi.fn().mockReturnValue({}),
  useDestinationsQuery: vi.fn().mockReturnValue({}),
  useDeleteDestinationMutation: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDestinationsQuery: queryMocks.useDestinationsQuery,
    useAllDestinationsQuery: queryMocks.useAllDestinationsQuery,
    useDeleteDestinationMutation: queryMocks.useDeleteDestinationMutation,
  };
});

const destination = destinationFactory.build({ id: 1 });
const destinations = [destination, ...destinationFactory.buildList(30)];

describe('Destinations Landing Table', () => {
  const renderComponentAndWaitForLoadingComplete = () => {
    renderWithTheme(<DestinationsLanding />, {
      initialRoute: '/logs/delivery/destinations',
    });
  };

  beforeEach(() => {
    mockMatchMedia();
  });

  it('should render destinations landing tab header and table with items PaginationFooter', () => {
    queryMocks.useAllDestinationsQuery.mockReturnValue({
      data: {
        data: destinations,
        results: 31,
      },
    });

    queryMocks.useDestinationsQuery.mockReturnValue({
      data: {
        data: destinations,
        results: 31,
      },
    });

    renderComponentAndWaitForLoadingComplete();

    // search text input
    screen.getByPlaceholderText('Search for a Destination');

    // button
    screen.getByText('Create Destination');

    // Table column headers
    screen.getByText('Name');
    screen.getByText('Type');
    screen.getByText('ID');
    screen.getByText('Creation Time');
    screen.getByText('Last Modified');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = screen.getAllByTestId(
      'textfield-input'
    )[1] as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render destinations landing table with empty row when there are no search results', () => {
    queryMocks.useAllDestinationsQuery.mockReturnValue({
      data: {
        data: destinations,
        results: 31,
      },
    });

    queryMocks.useDestinationsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    renderComponentAndWaitForLoadingComplete();

    const emptyRow = screen.getByText('No items to display.');
    expect(emptyRow).toBeInTheDocument();
  });

  it('should render destinations landing empty state', () => {
    queryMocks.useAllDestinationsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    renderComponentAndWaitForLoadingComplete();

    screen.getByText((text) =>
      text.includes('Create a destination for cloud logs')
    );
  });

  it('should render loading state when fetching all destinations', () => {
    queryMocks.useAllDestinationsQuery.mockReturnValue({
      data: {
        data: null,
        results: 0,
      },
      isLoading: true,
    });

    renderComponentAndWaitForLoadingComplete();

    const loadingElement = screen.queryByTestId(loadingTestId);
    expect(loadingElement).toBeInTheDocument();
  });

  const clickOnActionMenu = async () => {
    const actionMenu = screen.getByLabelText(
      `Action menu for Destination ${destination.label}`
    );
    await userEvent.click(actionMenu);
  };

  const clickOnActionMenuItem = async (itemText: string) => {
    await userEvent.click(screen.getByText(itemText));
  };

  describe('given action menu', () => {
    beforeEach(() => {
      queryMocks.useAllDestinationsQuery.mockReturnValue({
        data: {
          data: destinations,
          results: 31,
        },
      });

      queryMocks.useDestinationsQuery.mockReturnValue({
        data: {
          data: destinations,
          results: 31,
        },
      });
    });

    describe('when Edit clicked', () => {
      it('should navigate to edit page', async () => {
        const mockNavigate = vi.fn();
        queryMocks.useNavigate.mockReturnValue(mockNavigate);

        renderComponentAndWaitForLoadingComplete();

        await clickOnActionMenu();
        await clickOnActionMenuItem('Edit');

        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/logs/delivery/destinations/1/edit',
        });
      });
    });

    describe('when Delete clicked', () => {
      it('should delete destination', async () => {
        const mockDeleteDestinationMutation = vi.fn().mockResolvedValue({});
        queryMocks.useDeleteDestinationMutation.mockReturnValue({
          mutateAsync: mockDeleteDestinationMutation,
        });

        renderComponentAndWaitForLoadingComplete();
        await clickOnActionMenu();
        await clickOnActionMenuItem('Delete');

        expect(mockDeleteDestinationMutation).toHaveBeenCalledWith({
          id: 1,
        });
      });
    });
  });
});
