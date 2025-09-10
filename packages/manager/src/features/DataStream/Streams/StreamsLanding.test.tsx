import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { streamFactory } from 'src/factories/datastream';
import { StreamsLanding } from 'src/features/DataStream/Streams/StreamsLanding';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => vi.fn()),
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
    useUpdateStreamMutation: queryMocks.useUpdateStreamMutation,
    useDeleteStreamMutation: queryMocks.useDeleteStreamMutation,
  };
});

const stream = streamFactory.build({ id: 1 });
const streams = [stream, ...streamFactory.buildList(30)];

describe('Streams Landing Table', () => {
  const renderComponentAndWaitForLoadingComplete = async () => {
    renderWithTheme(<StreamsLanding />, {
      initialRoute: '/datastream/streams',
    });

    const loadingElement = screen.queryByTestId(loadingTestId);
    if (loadingElement) {
      await waitForElementToBeRemoved(loadingElement);
    }
  };

  beforeEach(() => {
    mockMatchMedia();
  });

  it('should render streams landing tab header and table with items PaginationFooter', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage(streams));
      })
    );

    await renderComponentAndWaitForLoadingComplete();

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

  it('should render streams landing empty state', async () => {
    server.use(
      http.get('*/monitor/streams', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    await renderComponentAndWaitForLoadingComplete();

    screen.getByText((text) =>
      text.includes('Create a data stream and configure delivery of cloud logs')
    );
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
      server.use(
        http.get('*/monitor/streams', () => {
          return HttpResponse.json(makeResourcePage(streams));
        })
      );
    });

    describe('when Edit clicked', () => {
      it('should navigate to edit page', async () => {
        const mockNavigate = vi.fn();
        queryMocks.useNavigate.mockReturnValue(mockNavigate);

        await renderComponentAndWaitForLoadingComplete();

        await clickOnActionMenu();
        await clickOnActionMenuItem('Edit');

        expect(mockNavigate).toHaveBeenCalledWith({
          to: '/datastream/streams/1/edit',
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
          label: 'Data Stream 1',
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
          label: 'Data Stream 1',
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
