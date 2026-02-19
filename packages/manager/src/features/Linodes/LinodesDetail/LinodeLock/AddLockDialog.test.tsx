import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddLockDialog } from './AddLockDialog';

const defaultProps = {
  linodeId: 123,
  linodeLabel: 'my-linode',
  onClose: vi.fn(),
  open: true,
};

describe('AddLockDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog with correct title and content', () => {
    const { getByText } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    expect(getByText('Add lock to my-linode?')).toBeVisible();
    expect(getByText('Choose the type of lock to apply.')).toBeVisible();
    expect(getByText('Apply Lock')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
  });

  it('should display both lock type options', () => {
    const { getByText } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    expect(getByText('Prevent deletion')).toBeVisible();
    expect(
      getByText('Prevents this Linode from being deleted or rebuilt.')
    ).toBeVisible();

    expect(
      getByText('Prevent deletion (including attached resources)')
    ).toBeVisible();
    expect(
      getByText(
        'Prevents this Linode and its attached resources (Disks, Configurations, IP Addresses, and Subinterfaces) from being deleted or rebuilt.'
      )
    ).toBeVisible();
  });

  it('should have "Prevent deletion" selected by default', () => {
    const { getByRole } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    const preventDeletionRadio = getByRole('radio', {
      name: /Prevent deletion Prevents this Linode from being deleted or rebuilt/i,
    });

    expect(preventDeletionRadio).toBeChecked();
  });

  it('should allow changing lock type selection', async () => {
    const { getByRole } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    const preventDeletionWithSubresourcesRadio = getByRole('radio', {
      name: /Prevent deletion \(including attached resources\)/i,
    });

    await userEvent.click(preventDeletionWithSubresourcesRadio);

    expect(preventDeletionWithSubresourcesRadio).toBeChecked();
  });

  it('should call onClose when Cancel is clicked', async () => {
    const { getByText } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    const cancelButton = getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should submit with correct payload and call onClose on success', async () => {
    let capturedPayload: unknown;

    server.use(
      http.post('*/v4beta/locks', async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({
          created: '2026-01-28T00:00:00',
          entity: {
            id: 123,
            label: 'my-linode',
            type: 'linode',
            url: '/v4beta/linodes/instances/123',
          },
          id: 1,
          lock_type: 'cannot_delete',
        });
      })
    );

    const { getByText } = renderWithTheme(<AddLockDialog {...defaultProps} />);

    const applyLockButton = getByText('Apply Lock');
    await userEvent.click(applyLockButton);

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    expect(capturedPayload).toEqual({
      entity_id: 123,
      entity_type: 'linode',
      lock_type: 'cannot_delete',
    });
  });

  it('should submit with cannot_delete_with_subresources when selected', async () => {
    let capturedPayload: unknown;

    server.use(
      http.post('*/v4beta/locks', async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({
          created: '2026-01-28T00:00:00',
          entity: {
            id: 123,
            label: 'my-linode',
            type: 'linode',
            url: '/v4beta/linodes/instances/123',
          },
          id: 1,
          lock_type: 'cannot_delete_with_subresources',
        });
      })
    );

    const { getByRole, getByText } = renderWithTheme(
      <AddLockDialog {...defaultProps} />
    );

    const preventDeletionWithSubresourcesRadio = getByRole('radio', {
      name: /Prevent deletion \(including attached resources\)/i,
    });
    await userEvent.click(preventDeletionWithSubresourcesRadio);

    const applyLockButton = getByText('Apply Lock');
    await userEvent.click(applyLockButton);

    await waitFor(() => {
      expect(capturedPayload).toEqual({
        entity_id: 123,
        entity_type: 'linode',
        lock_type: 'cannot_delete_with_subresources',
      });
    });
  });

  it('should reset state when dialog is reopened', async () => {
    const { getByRole, rerender } = renderWithTheme(
      <AddLockDialog {...defaultProps} />
    );

    // Select the second option
    const preventDeletionWithSubresourcesRadio = getByRole('radio', {
      name: /Prevent deletion \(including attached resources\)/i,
    });
    await userEvent.click(preventDeletionWithSubresourcesRadio);
    expect(preventDeletionWithSubresourcesRadio).toBeChecked();

    // Close and reopen the dialog
    rerender(<AddLockDialog {...defaultProps} open={false} />);
    rerender(<AddLockDialog {...defaultProps} open={true} />);

    // The default option should be selected again
    const preventDeletionRadio = getByRole('radio', {
      name: /Prevent deletion Prevents this Linode from being deleted or rebuilt/i,
    });
    expect(preventDeletionRadio).toBeChecked();
  });

  it('should not render dialog content when open is false', () => {
    const { queryByText } = renderWithTheme(
      <AddLockDialog {...defaultProps} open={false} />
    );

    expect(queryByText('Add lock to my-linode?')).not.toBeInTheDocument();
  });

  it('should not submit if linodeId is undefined', async () => {
    const mockOnClose = vi.fn();

    server.use(
      http.post('*/v4beta/locks', () => {
        return HttpResponse.json({});
      })
    );

    const { getByText } = renderWithTheme(
      <AddLockDialog
        {...defaultProps}
        linodeId={undefined}
        onClose={mockOnClose}
      />
    );

    const applyLockButton = getByText('Apply Lock');
    await userEvent.click(applyLockButton);

    // Wait a bit to ensure no async operation completes
    await new Promise((resolve) => setTimeout(resolve, 100));

    // onClose should not have been called since the submission should be blocked
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
