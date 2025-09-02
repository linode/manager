import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { streamFactory } from 'src/factories/delivery';
import { StreamsLanding } from 'src/features/Delivery/Streams/StreamsLanding';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';
const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
  useAllStreamsQuery: vi.fn().mockReturnValue({}),
  useStreamsQuery: vi.fn().mockReturnValue({}),
  useUpdateStreamMutation: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
  useDeleteStreamMutation: vi.fn().mockReturnValue({
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
    useStreamsQuery: queryMocks.useStreamsQuery,
    useAllStreamsQuery: queryMocks.useAllStreamsQuery,
    useUpdateStreamMutation: queryMocks.useUpdateStreamMutation,
    useDeleteStreamMutation: queryMocks.useDeleteStreamMutation,
  };
});

const stream = streamFactory.build({ id: 1 });
const streams = [stream, ...streamFactory.buildList(30)];

describe('Streams Landing Table', () => {
  const renderComponentAndWaitForLoadingComplete = () => {
    renderWithTheme(<StreamsLanding />, {
      initialRoute: '/logs/delivery/streams',
    });
  };

  beforeEach(() => {
    mockMatchMedia();
  });

  it('should render streams landing tab header and table with items PaginationFooter', () => {
    queryMocks.useAllStreamsQuery.mockReturnValue({
      data: {
        data: streams,
        results: 31,
      },
      isLoading: false,
    });

    queryMocks.useStreamsQuery.mockReturnValue({
      data: {
        data: streams,
        results: 31,
      },
      isLoading: false,
    });

    renderComponentAndWaitForLoadingComplete();

    // search text input
    screen.getByPlaceholderText('Search for a Stream');

    // select
    screen.getByLabelText('Status');

    // button
    screen.getByText('Create Stream');

    // Table column headers
    screen.getByText('Name');
    screen.getByText('Stream Type');
    within(screen.getByRole('table')).getByText('Status');
    screen.getByText('ID');
    screen.getByText('Destination Type');
    screen.getByText('Creation Time');

    // PaginationFooter
    const paginationFooterSelectPageSizeInput = screen.getAllByTestId(
      'textfield-input'
    )[2] as HTMLInputElement;
    expect(paginationFooterSelectPageSizeInput.value).toBe('Show 25');
  });

  it('should render streams landing table with empty row when there are no search results', () => {
    queryMocks.useAllStreamsQuery.mockReturnValue({
      data: {
        data: streams,
        results: 31,
      },
    });

    queryMocks.useStreamsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    renderComponentAndWaitForLoadingComplete();

    const emptyRow = screen.getByText('No items to display.');
    expect(emptyRow).toBeInTheDocument();
  });

  it('should render streams landing empty state', () => {
    queryMocks.useAllStreamsQuery.mockReturnValue({
      data: {
        data: [],
        results: 0,
      },
    });

    renderComponentAndWaitForLoadingComplete();

    screen.getByText((text) =>
      text.includes('Create a stream and configure delivery of cloud logs')
    );
  });

  it('should render loading state when fetching all streams', () => {
    queryMocks.useAllStreamsQuery.mockReturnValue({
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
      `Action menu for Stream ${stream.label}`
    );
    await userEvent.click(actionMenu);
  };

  const clickOnActionMenuItem = async (itemText: string) => {
    await userEvent.click(screen.getByText(itemText));
  };

  describe('given action menu', () => {
    beforeEach(() => {
      queryMocks.useAllStreamsQuery.mockReturnValue({
        data: {
          data: streams,
          results: 31,
        },
      });

      queryMocks.useStreamsQuery.mockReturnValue({
        data: {
          data: streams,
          results: 31,
        },
      });
    });

    describe('when Edit clicked', () => {
      it('should navigate to edit page', async () => {
        const mockNavigate = vi.fn();
        queryMocks.useNavigate.mockReturnValue(mockNavigate);

        await renderComponentAndWaitForLoadingComplete();

        await clickOnActionMenu();
        await clickOnActionMenuItem('Edit');

        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/logs/delivery/streams/1/edit',
        });
      });
    });

    describe('when Disable clicked', () => {
      it('should update stream with proper parameters', async () => {
        const mockUpdateStreamMutation = vi.fn().mockResolvedValue({});
        queryMocks.useUpdateStreamMutation.mockReturnValue({
          mutateAsync: mockUpdateStreamMutation,
        });

        await renderComponentAndWaitForLoadingComplete();
        await clickOnActionMenu();
        await clickOnActionMenuItem('Disable');

        expect(mockUpdateStreamMutation).toHaveBeenCalledWith({
          id: 1,
          status: 'inactive',
          label: 'Stream 1',
          destinations: [123],
          details: {},
          type: 'audit_logs',
        });
      });
    });

    describe('when Enable clicked', () => {
      it('should update stream with proper parameters', async () => {
        const mockUpdateStreamMutation = vi.fn().mockResolvedValue({});
        queryMocks.useUpdateStreamMutation.mockReturnValue({
          mutateAsync: mockUpdateStreamMutation,
        });

        stream.status = 'inactive';
        await renderComponentAndWaitForLoadingComplete();
        await clickOnActionMenu();
        await clickOnActionMenuItem('Enable');

        expect(mockUpdateStreamMutation).toHaveBeenCalledWith({
          id: 1,
          status: 'active',
          label: 'Stream 1',
          destinations: [123],
          details: {},
          type: 'audit_logs',
        });
      });
    });

    describe('when Delete clicked', () => {
      it('should delete stream', async () => {
        const mockDeleteStreamMutation = vi.fn().mockResolvedValue({});
        queryMocks.useDeleteStreamMutation.mockReturnValue({
          mutateAsync: mockDeleteStreamMutation,
        });

        await renderComponentAndWaitForLoadingComplete();
        await clickOnActionMenu();
        await clickOnActionMenuItem('Delete');

        expect(mockDeleteStreamMutation).toHaveBeenCalledWith({
          id: 1,
        });
      });
    });
  });
});
