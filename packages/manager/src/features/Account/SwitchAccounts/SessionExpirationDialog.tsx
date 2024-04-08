import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { sessionExpirationContext as _sessionExpirationContext } from 'src/context/sessionExpirationContext';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import {
  getPersonalAccessTokenForRevocation,
  setTokenInLocalStorage,
} from 'src/features/Account/SwitchAccounts/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useAccount } from 'src/queries/account/account';
import { usePersonalAccessTokensQuery } from 'src/queries/tokens';
import { parseAPIDate } from 'src/utilities/date';
import { pluralize } from 'src/utilities/pluralize';
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

    const { data: personalAccessTokens } = usePersonalAccessTokensQuery();
    const history = useHistory();
    const { data: account } = useAccount();
    const currentTokenWithBearer = useCurrentToken() ?? '';

    const euuid = account?.euuid ?? '';
    const pendingRevocationToken = getPersonalAccessTokenForRevocation(
      personalAccessTokens?.data,
      currentTokenWithBearer
    );

    const {
      createToken,
      createTokenError,
      createTokenLoading,
      revokeToken,
      updateCurrentToken,
      validateParentToken,
    } = useParentChildAuthentication({
      tokenIdToRevoke: pendingRevocationToken?.id ?? -1,
    });

    const createTokenErrorReason = createTokenError?.[0]?.reason;

    const formattedTimeRemaining = `${timeRemaining.minutes}:${
      timeRemaining.seconds < 10 ? '0' : ''
    }${timeRemaining.seconds}`;

    /**
     * Redirect to the logout page if the parent token is invalid.
     * Otherwise, switch back to the parent account.
     */
    const handleLogout = async () => {
      setLogoutLoading(true);

      if (!validateParentToken()) {
        history.push('/logout');
      }

      try {
        await revokeToken();
      } catch (error) {
        // Swallow error: Allow user account switching; tokens expire naturally.
      }

      updateCurrentToken({ userType: 'parent' });

      // Reset flag for proxy user to display success toast once.
      setStorage('is_proxy_user', 'false');
      setLogoutLoading(false);

      onClose();
      location.reload();
    };

    const handleRefreshToken = async ({ euuid }: { euuid: string }) => {
      try {
        try {
          await revokeToken();
        } catch (error) {
          // Swallow error: Allow user account switching; tokens expire naturally.
        }

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
      let timeoutId: NodeJS.Timeout | undefined;

      const checkTokenExpiry = () => {
        const expiryString = getStorage('authentication/proxy_token/expire');
        if (!expiryString) {
          return;
        }

        // Calculate the difference from now until the expiry time in both minutes and seconds
        const diff = parseAPIDate(expiryString)
          .diffNow(['minutes', 'seconds'])
          .toObject();

        // Format the remaining time as MM:SS, ensuring minutes and seconds are correctly rounded
        const minutes = Math.max(0, Math.floor(diff.minutes ?? 0));
        const seconds = Math.max(0, Math.floor(diff.seconds ?? 0) % 60); // Ensure seconds don't exceed 60

        setTimeRemaining({
          minutes,
          seconds,
        });

        // Set or reset the timeout to check every second for real-time countdown accuracy
        timeoutId = setTimeout(checkTokenExpiry, 1000);
      };

      // Initial timer setup
      checkTokenExpiry();

      // Cleanup function to clear the timeout when the component unmounts
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, []);

    useEffect(() => {
      if (timeRemaining.minutes < 5) {
        sessionExpirationContext.updateState({ isOpen: true });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining.minutes, sessionExpirationContext.updateState]);

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
        onClose={() => {
          onClose();
        }}
        actions={actions}
        data-testid="session-expiration-dialog"
        error={createTokenErrorReason}
        maxWidth="xs"
        open={isOpen}
        title="Your session is about to expire"
      >
        <Typography>
          Your session will expire in{' '}
          {pluralize('minute', 'minutes', formattedTimeRemaining)}. Do you want
          to continue working?
        </Typography>
      </ConfirmationDialog>
    );
  }
);
