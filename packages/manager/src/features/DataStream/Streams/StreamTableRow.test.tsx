import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { streamFactory } from 'src/factories/datastream';
import { StreamTableRow } from 'src/features/DataStream/Streams/StreamTableRow';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

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

describe('StreamTableRow', () => {
  const stream = { ...streamFactory.build(), id: 1 };

  const renderStreamTableRow = () => {
    mockMatchMedia();
    renderWithTheme(wrapWithTableBody(<StreamTableRow stream={stream} />));
  };

  const clickOnActionMenu = async () => {
    const actionMenu = screen.getByLabelText(
      `Action menu for ${stream.label} stream`
    );
    await userEvent.click(actionMenu);
  };

  const clickOnActionMenuItem = async (itemText: string) => {
    await userEvent.click(screen.getByText(itemText));
  };

  it('should render a stream row', async () => {
    renderStreamTableRow();

    // Name:
    screen.getByText('Data Stream 1');
    // Stream Type:
    screen.getByText('Audit Logs');
    // Status:
    screen.getByText('Enabled');
    // Destination Type:
    screen.getByText('Linode Object Storage');
    // ID:
    screen.getByText('1');
    // Creation Time:
    screen.getByText(/2025-07-30/);

    await clickOnActionMenu();

    expect(screen.getByText('Edit')).toBeVisible();
    expect(screen.getByText('Disable')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });

  describe('given action menu', () => {
    describe('when Edit clicked', () => {
      it('should navigate to edit page', async () => {
        const mockNavigate = vi.fn();
        queryMocks.useNavigate.mockReturnValue(mockNavigate);

        renderStreamTableRow();
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

        renderStreamTableRow();
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

    describe('when Enabled clicked', () => {
      it('should update stream with proper parameters', async () => {
        const mockUpdateStreamMutation = vi.fn().mockResolvedValue({});
        queryMocks.useUpdateStreamMutation.mockReturnValue({
          mutateAsync: mockUpdateStreamMutation,
        });

        stream.status = 'inactive';
        renderStreamTableRow();
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
      it('should update stream with proper parameters', async () => {
        const mockDeleteStreamMutation = vi.fn().mockResolvedValue({});
        queryMocks.useDeleteStreamMutation.mockReturnValue({
          mutateAsync: mockDeleteStreamMutation,
        });

        renderStreamTableRow();
        await clickOnActionMenu();
        await clickOnActionMenuItem('Delete');

        expect(mockDeleteStreamMutation).toHaveBeenCalledWith({
          id: 1,
        });
      });
    });
  });
});
