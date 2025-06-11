import { useAccount } from '@linode/queries';
import { ActionsPanel, Typography } from '@linode/ui';
import { pluralize, useInterval } from '@linode/utilities';
import React, { useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { sessionExpirationContext as _sessionExpirationContext } from 'src/context/sessionExpirationContext';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { parseAPIDate } from 'src/utilities/date';
import { getStorage, setStorage } from 'src/utilities/storage';

interface SessionExpirationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionExpirationDialog = React.memo(
  ({ isOpen, onClose }: SessionExpirationDialogProps) => {
    const sessionExpirationContext = React.useContext(
      _sessionExpirationContext
    );

    const [timeRemaining, setTimeRemaining] = React.useState<{
      minutes: number;
      seconds: number;
    }>({
      minutes: 15,
      seconds: 0,
    });
    const [logoutLoading, setLogoutLoading] = React.useState(false);
    const history = useHistory();
    const { data: account } = useAccount();
    const euuid = account?.euuid ?? '';

    const {
      createToken,
      createTokenError,
      createTokenLoading,
      revokeToken,
      updateCurrentToken,
      validateParentToken,
    } = useParentChildAuthentication();

    const createTokenErrorReason = createTokenError?.[0]?.reason;

    const formattedTimeRemaining = `${timeRemaining.minutes}:${
      timeRemaining.seconds < 10 ? '0' : ''
    }${timeRemaining.seconds}`;

    const intervalCallback = () => {
      if (timeRemaining.minutes === 5) {
        sessionExpirationContext.updateState({ isOpen: true });
      }
      setTimeRemaining((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          cancel();
          handleLogout();
          return prev;
        }
        return {
          minutes: prev.seconds === 0 ? prev.minutes - 1 : prev.minutes,
          seconds: prev.seconds === 0 ? 59 : prev.seconds - 1,
        };
      });
    };

    const { cancel } = useInterval({
      callback: intervalCallback,
      cancelOnError: true,
      delay: 1000,
      startImmediately: true,
    });

    /**
     * Redirect to the logout page if the parent token is invalid.
     * Otherwise, switch back to the parent account.
     */
    const handleLogout = async () => {
      setLogoutLoading(true);

      if (!validateParentToken()) {
        history.push('/logout');
      }

      await revokeToken().catch(() => {
        /* Allow user account switching; tokens will expire naturally. */
      });

      updateCurrentToken({ userType: 'parent' });

      // Reset flag for proxy user to display success toast once.
      setStorage('is_proxy_user', 'false');
      setLogoutLoading(false);

      onClose();
      location.reload();
    };

    const handleRefreshToken = async ({ euuid }: { euuid: string }) => {
      try {
        await revokeToken().catch(() => {
          /* Allow user account switching; tokens will expire naturally. */
        });

        const proxyToken = await createToken(euuid);

        setTokenInLocalStorage({
          prefix: 'authentication/proxy_token',
          token: {
            ...proxyToken,
            token: `Bearer ${proxyToken.token}`,
          },
        });

        updateCurrentToken({ userType: 'proxy' });
        onClose();
        location.reload();
      } catch (error) {
        // Error is handled by createTokenError.
      }
    };

    /**
     * This useEffect hook sets up a real-time countdown to track the expiry of a token stored in local storage.
     * It calculates the remaining time until expiry in minutes and seconds, updating this countdown every second.
     * Upon component unmount, it clears the timeout to prevent memory leaks, ensuring the countdown stops accurately.
     */
    useEffect(() => {
      const checkTokenExpiry = () => {
        const expiryString = getStorage('authentication/proxy_token/expire');

        if (!expiryString) {
          return;
        }

        // Calculate the difference from now until the expiry time in both minutes and seconds
        const diff = parseAPIDate(expiryString)
          .diffNow(['minutes', 'seconds'])
          .toObject();

        // Format the remaining time as MM:SS
        setTimeRemaining({
          minutes: Math.max(0, Math.floor(diff.minutes ?? 0)),
          seconds: Math.max(0, Math.floor(diff.seconds ?? 0) % 60),
        });
      };

      // Initial timer setup
      checkTokenExpiry();
    }, []);

    const actions = (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Continue Working',
          loading: createTokenLoading,
          onClick: () =>
            handleRefreshToken({
              euuid,
            }),
        }}
        secondaryButtonProps={{
          label: 'Log Out',
          loading: logoutLoading,
          onClick: handleLogout,
        }}
      />
    );

    return (
      <ConfirmationDialog
        actions={actions}
        data-testid="session-expiration-dialog"
        error={createTokenErrorReason}
        maxWidth="xs"
        onClose={() => {
          onClose();
        }}
        open={isOpen}
        title="Your session is about to expire"
      >
        <Typography>
          Your session will expire in{' '}
          {pluralize('minute', 'minutes', formattedTimeRemaining)}. Logging out
          will return you to your active parent account or the login screen.
          Would you like to continue working?
        </Typography>
      </ConfirmationDialog>
    );
  }
);
