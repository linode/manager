import React from 'react';

import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { clearStorage, setStorage } from 'src/utilities/storage';

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
    // Clean up the company name in storage to prevent it from being used in the parent account after switching back from a child account.
    clearStorage('switch_account/company_name');
    try {
      // Revoke proxy or delegate token before switching to parent account.
      await revokeToken().catch(() => {
        /* Allow user account switching; tokens will expire naturally. */
      });

      updateCurrentToken({ userType: 'parent' });

      // Reset flag for proxy or delegate user to display success toast once.
      if (isProxyUserType) {
        setStorage('is_proxy_user_type', 'false');
      } else if (isDelegateUserType) {
        setStorage('is_delegate_user_type', 'false');
      }

      onClose?.();
      location.reload();
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
