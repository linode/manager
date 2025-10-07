import { isNumeric } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { oauthClient } from 'src/OAuth/oauth';
import { storage } from 'src/utilities/storage';

export const useSessionExpiryToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = storage.authentication.token.get();
    const expiresAt = storage.authentication.expire.get();

    if (!token || !expiresAt) {
      // Early return if no token is stored.
      return;
    }

    /**
     * Only show the session expiry toast for **admins** that have logged in as a customer.
     * Do **not** show a session expiry for regular customers.
     * (We can change this in the future if we want, we just need to run it by product)
     */
    if (!oauthClient.getIsAdminToken(token)) {
      // Early return if we're not logged in as a customer
      return;
    }

    // This value use to be a string representation of the date but now it is
    // a unix timestamp. Early return if it is the old format.
    if (!isNumeric(expiresAt)) {
      return;
    }

    const millisecondsUntilTokenExpires = +expiresAt - Date.now();

    // Show an expiry toast 1 minute before token expires.
    const showToastIn = millisecondsUntilTokenExpires - 60 * 1000;

    if (showToastIn <= 0) {
      // Token has already expired
      return;
    }

    const timeout = setTimeout(() => {
      enqueueSnackbar('Your session will expire in 1 minute.', {
        variant: 'info',
      });
    }, showToastIn);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return null;
};
