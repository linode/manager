import React from 'react';

import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { setStorage, storage } from 'src/utilities/storage';

import { useParentChildAuthentication } from './useParentChildAuthentication';

import type { APIError } from '@linode/api-v4';

interface UseSwitchToParentAccountProps {
  isDelegateUserType?: boolean;
  isProxyUserType?: boolean;
  onClose?: () => void;
  onTokenExpired?: (error: APIError) => void;
}

export const useSwitchToParentAccount = ({
  isDelegateUserType,
  isProxyUserType,
  onClose,
  onTokenExpired,
}: UseSwitchToParentAccountProps = {}) => {
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);

  const { revokeToken, updateCurrentToken, validateParentToken } =
    useParentChildAuthentication();

  const handleSwitchToParentAccount = React.useCallback(async () => {
    if (!validateParentToken()) {
      const expiredTokenError: APIError = {
        field: 'token',
        reason: PARENT_USER_SESSION_EXPIRED,
      };

      onTokenExpired?.(expiredTokenError);
      return;
    }

    // Flag to prevent multiple clicks on the switch account button.
    setSubmitting(true);

    try {
      // Revoke proxy or delegate token before switching to parent account.
      await revokeToken().catch(() => {
        /* Allow user account switching; tokens will expire naturally. */
      });

      updateCurrentToken({ userType: 'parent' });
      storage.authentication.childAccountEuid.clear();

      // Reset flag for proxy or delegate user to display success toast once.
      if (isProxyUserType) {
        setStorage('is_proxy_user_type', 'false');
      } else if (isDelegateUserType) {
        setStorage('is_delegate_user_type', 'false');
      }

      onClose?.();

      // For switch back to parent, always redirect to /linodes for delegate users
      if (isDelegateUserType) {
        location.replace('/linodes');
      } else {
        location.reload();
      }
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  }, [
    validateParentToken,
    onTokenExpired,
    revokeToken,
    updateCurrentToken,
    isProxyUserType,
    isDelegateUserType,
    onClose,
  ]);

  return {
    handleSwitchToParentAccount,
    isSubmitting,
  };
};
