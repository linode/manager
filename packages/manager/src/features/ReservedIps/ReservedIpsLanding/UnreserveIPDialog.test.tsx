import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ipAddressFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UnreserveIPDialog } from './UnreserveIPDialog';

const mockMutateAsync = vi.fn();
const mockReset = vi.fn();
const mockEnqueueSnackbar = vi.fn();
const mockOnClose = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useUnReserveIPMutation: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useUnReserveIPMutation: queryMocks.useUnReserveIPMutation,
}));

vi.mock('notistack', async (importOriginal) => ({
  ...(await importOriginal()),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
}));

const ipAddress = ipAddressFactory.build({ address: '203.0.113.10' });

const defaultProps = {
  ipAddress,
  onClose: mockOnClose,
  open: true,
};

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockReset.mockReset();
  mockEnqueueSnackbar.mockReset();
  mockOnClose.mockReset();

  queryMocks.useUnReserveIPMutation.mockReturnValue({
    isPending: false,
    mutateAsync: mockMutateAsync,
    reset: mockReset,
  });
});

describe('UnreserveIPDialog', () => {
  it('renders the dialog with the correct title', () => {
    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    expect(screen.getByText('Unreserve 203.0.113.10')).toBeVisible();
  });

  it('renders the confirmation message', () => {
    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    expect(
      screen.getByText(
        /Unreserving this IP will remove it from your reserved list/i
      )
    ).toBeVisible();
  });

  it('renders the Unreserve and Cancel buttons', () => {
    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Unreserve' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('does not render when open is false', () => {
    renderWithTheme(<UnreserveIPDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Unreserve 203.0.113.10?')).toBeNull();
  });

  it('calls onClose when Cancel is clicked', async () => {
    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows success snackbar, and closes on successful submit', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: 'Unreserve' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      '203.0.113.10 has been unreserved.',
      { variant: 'success' }
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows an error notice when the API call fails', async () => {
    mockMutateAsync.mockRejectedValueOnce([
      { reason: 'IP address could not be unreserved.' },
    ]);

    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    await userEvent.click(screen.getByRole('button', { name: 'Unreserve' }));

    await waitFor(() => {
      expect(
        screen.getByText('IP address could not be unreserved.')
      ).toBeVisible();
    });
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('clears the error when the retry succeeds after a prior failure', async () => {
    mockMutateAsync
      .mockRejectedValueOnce([{ reason: 'Temporary network error.' }])
      .mockResolvedValueOnce({});

    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    // First attempt fails — error appears
    await userEvent.click(screen.getByRole('button', { name: 'Unreserve' }));
    await waitFor(() =>
      expect(screen.getByText('Temporary network error.')).toBeVisible()
    );

    // Retry — should succeed and call onClose
    await userEvent.click(screen.getByRole('button', { name: 'Unreserve' }));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled());
  });

  it('disables both buttons while the request is pending', () => {
    queryMocks.useUnReserveIPMutation.mockReturnValue({
      isPending: true,
      mutateAsync: mockMutateAsync,
      reset: mockReset,
    });

    renderWithTheme(<UnreserveIPDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Unreserve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
