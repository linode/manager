import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { lockFactory } from 'src/factories/locks';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RemoveLockDialog } from './RemoveLockDialog';

import type { LockType } from '@linode/api-v4';

const mockGetLocks = vi.fn();
const mockDeleteLock = vi.fn();
const mockEnqueueSnackbar = vi.fn();

vi.mock('@linode/api-v4', async () => {
  const actual = await vi.importActual('@linode/api-v4');
  return {
    ...actual,
    deleteLock: () => mockDeleteLock(),
    getLocks: () => mockGetLocks(),
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    }),
  };
});

const defaultProps = {
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodeLocks: ['cannot_delete'] as LockType[],
  onClose: vi.fn(),
  open: true,
};

describe('RemoveLockDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog with correct title', () => {
    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    expect(getByText('Remove Lock?')).toBeVisible();
  });

  it('should display correct description for cannot_delete lock type', () => {
    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} linodeLocks={['cannot_delete']} />
    );

    expect(
      getByText('Unlocking will allow this Linode to be deleted or rebuilt.')
    ).toBeVisible();
  });

  it('should display correct description for cannot_delete_with_subresources lock type', () => {
    const { getByText } = renderWithTheme(
      <RemoveLockDialog
        {...defaultProps}
        linodeLocks={['cannot_delete_with_subresources']}
      />
    );

    expect(
      getByText(
        'Unlocking will allow this Linode and all its attached resources to be deleted or rebuilt.'
      )
    ).toBeVisible();
  });

  it('should have Remove Lock and Cancel buttons', () => {
    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    expect(getByText('Remove Lock')).toBeVisible();
    expect(getByText('Cancel')).toBeVisible();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} onClose={onClose} />
    );

    await userEvent.click(getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render when open is false', () => {
    const { queryByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} open={false} />
    );

    expect(queryByText('Remove Lock?')).toBeNull();
  });

  it('should fetch locks and delete lock on submit', async () => {
    const lock = lockFactory.build({
      entity: { id: 1, type: 'linode' },
      id: 123,
    });

    mockGetLocks.mockResolvedValueOnce({
      data: [lock],
      page: 1,
      pages: 1,
      results: 1,
    });
    mockDeleteLock.mockResolvedValueOnce({});

    const onClose = vi.fn();
    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} onClose={onClose} />
    );

    await userEvent.click(getByText('Remove Lock'));

    await waitFor(() => {
      expect(mockGetLocks).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockDeleteLock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Lock removed from test-linode.',
        { variant: 'success' }
      );
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show error when no lock is found', async () => {
    mockGetLocks.mockResolvedValueOnce({
      data: [],
      page: 1,
      pages: 1,
      results: 0,
    });

    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    await userEvent.click(getByText('Remove Lock'));

    await waitFor(() => {
      expect(getByText('No active lock found for this Linode.')).toBeVisible();
    });
  });

  it('should show error when getLocks fails', async () => {
    mockGetLocks.mockRejectedValueOnce([{ reason: 'Failed to fetch locks' }]);

    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    await userEvent.click(getByText('Remove Lock'));

    await waitFor(() => {
      expect(getByText('Failed to fetch locks')).toBeVisible();
    });
  });

  it('should show error when deleteLock fails', async () => {
    const lock = lockFactory.build({
      entity: { id: 1, type: 'linode' },
      id: 123,
    });

    mockGetLocks.mockResolvedValueOnce({
      data: [lock],
      page: 1,
      pages: 1,
      results: 1,
    });
    mockDeleteLock.mockRejectedValueOnce([{ reason: 'Failed to delete lock' }]);

    const { getByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    await userEvent.click(getByText('Remove Lock'));

    await waitFor(() => {
      expect(getByText('Failed to delete lock')).toBeVisible();
    });
  });

  it('should reset error state when dialog reopens', async () => {
    mockGetLocks.mockResolvedValueOnce({
      data: [],
      page: 1,
      pages: 1,
      results: 0,
    });

    const { getByText, rerender, queryByText } = renderWithTheme(
      <RemoveLockDialog {...defaultProps} />
    );

    // Trigger error
    await userEvent.click(getByText('Remove Lock'));

    await waitFor(() => {
      expect(getByText('No active lock found for this Linode.')).toBeVisible();
    });

    // Close dialog
    rerender(<RemoveLockDialog {...defaultProps} open={false} />);

    // Reopen dialog
    rerender(<RemoveLockDialog {...defaultProps} open={true} />);

    // Error should be cleared
    expect(queryByText('No active lock found for this Linode.')).toBeNull();
  });
});
