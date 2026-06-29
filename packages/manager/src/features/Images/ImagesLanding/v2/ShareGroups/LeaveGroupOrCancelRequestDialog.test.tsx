import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CANCEL_MEMBERSHIP_REQUEST_DIALOG_COPY,
  CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS,
  LEAVE_GROUP_DIALOG_PENDO_IDS,
} from '../constants';
import { LeaveGroupOrCancelRequestDialog } from './LeaveGroupOrCancelRequestDialog';

const mockMutateAsync = vi.fn();

const queryMocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
  useDeleteTokenFromShareGroupMutation: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useDeleteTokenFromShareGroupMutation:
      queryMocks.useDeleteTokenFromShareGroupMutation,
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    enqueueSnackbar: queryMocks.enqueueSnackbar,
  };
});

const leavePendoIDs = {
  cancelButton: LEAVE_GROUP_DIALOG_PENDO_IDS.cancelButton.joinedGroupLanding,
  confirmButton: LEAVE_GROUP_DIALOG_PENDO_IDS.confirmButton.joinedGroupLanding,
  xButton: LEAVE_GROUP_DIALOG_PENDO_IDS.xButton.joinedGroupLanding,
};

const cancelRequestPendoIDs = {
  cancelButton: CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.cancelButton,
  confirmButton: CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.confirmButton,
  xButton: CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.xButton,
};

const baseProps = {
  groupName: 'My Test Group',
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  open: true,
  tokenUuid: 'test-token-uuid',
};

describe('LeaveGroupOrCancelRequestDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useDeleteTokenFromShareGroupMutation.mockImplementation(
      (options) => ({
        error: null,
        isPending: false,
        mutateAsync: mockMutateAsync.mockImplementation(async (args) => {
          options.onSuccess?.({}, args, undefined);
        }),
      })
    );
  });

  describe('Leave Group dialog', () => {
    const props = {
      ...baseProps,
      pendoIDs: leavePendoIDs,
    };

    it('renders the correct title', () => {
      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByText(`Leave ${props.groupName}`)).toBeVisible();
    });

    it('renders the correct body text', () => {
      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(
        getByText(/Are you sure you want to leave share group/)
      ).toBeVisible();
    });

    it('renders "Leave Share Group" as the confirm button label', () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByRole('button', { name: 'Leave Share Group' })).toBeVisible();
    });

    it('renders "Stay in the Group" as the cancel button label', () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByRole('button', { name: 'Stay in the Group' })).toBeVisible();
    });

    it('calls onClose when the cancel button is clicked', async () => {
      const onClose = vi.fn();
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} onClose={onClose} />
      );

      await userEvent.click(getByRole('button', { name: 'Stay in the Group' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls deleteTokenFromShareGroup with the correct tokenUuid when confirmed', async () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      await userEvent.click(getByRole('button', { name: 'Leave Share Group' }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          tokenUuid: props.tokenUuid,
        });
      });
    });

    it('shows a success snackbar with the group name after leaving', async () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      await userEvent.click(getByRole('button', { name: 'Leave Share Group' }));

      await waitFor(() => {
        expect(queryMocks.enqueueSnackbar).toHaveBeenCalledWith(
          `Token removed from ${props.groupName} successfully.`,
          { variant: 'success' }
        );
      });
    });

    it('calls the onSuccess prop after successfully leaving the group', async () => {
      const onSuccess = vi.fn();
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} onSuccess={onSuccess} />
      );

      await userEvent.click(getByRole('button', { name: 'Leave Share Group' }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('displays an API error when the mutation fails', () => {
      const apiError = [{ reason: 'An error occurred.' }];
      queryMocks.useDeleteTokenFromShareGroupMutation.mockReturnValueOnce({
        error: apiError,
        isPending: false,
        mutateAsync: vi.fn(),
      });

      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByText('An error occurred.')).toBeVisible();
    });
  });

  describe('Cancel Membership Request dialog', () => {
    const props = {
      ...baseProps,
      isCancelRequestDialog: true,
      pendoIDs: cancelRequestPendoIDs,
    };

    it('renders the correct title', () => {
      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByText('Cancel membership request')).toBeVisible();
    });

    it('renders the correct body text', () => {
      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByText(CANCEL_MEMBERSHIP_REQUEST_DIALOG_COPY)).toBeVisible();
    });

    it('renders "Cancel Membership Request" as the confirm button label', () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(
        getByRole('button', { name: 'Cancel Membership Request' })
      ).toBeVisible();
    });

    it('renders "Keep Membership Request" as the cancel button label', () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(
        getByRole('button', { name: 'Keep Membership Request' })
      ).toBeVisible();
    });

    it('calls onClose when the cancel button is clicked', async () => {
      const onClose = vi.fn();
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} onClose={onClose} />
      );

      await userEvent.click(
        getByRole('button', { name: 'Keep Membership Request' })
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls deleteTokenFromShareGroup with the correct tokenUuid when confirmed', async () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      await userEvent.click(
        getByRole('button', { name: 'Cancel Membership Request' })
      );

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          tokenUuid: props.tokenUuid,
        });
      });
    });

    it('shows a "Membership request canceled." success snackbar after confirming', async () => {
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      await userEvent.click(
        getByRole('button', { name: 'Cancel Membership Request' })
      );

      await waitFor(() => {
        expect(queryMocks.enqueueSnackbar).toHaveBeenCalledWith(
          'Membership request canceled.',
          { variant: 'success' }
        );
      });
    });

    it('calls the onSuccess prop after successfully canceling the request', async () => {
      const onSuccess = vi.fn();
      const { getByRole } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} onSuccess={onSuccess} />
      );

      await userEvent.click(
        getByRole('button', { name: 'Cancel Membership Request' })
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('displays an API error when the mutation fails', () => {
      const apiError = [{ reason: 'Request failed.' }];
      queryMocks.useDeleteTokenFromShareGroupMutation.mockReturnValueOnce({
        error: apiError,
        isPending: false,
        mutateAsync: vi.fn(),
      });

      const { getByText } = renderWithTheme(
        <LeaveGroupOrCancelRequestDialog {...props} />
      );

      expect(getByText('Request failed.')).toBeVisible();
    });
  });
});
