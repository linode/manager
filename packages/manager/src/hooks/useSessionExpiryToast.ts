import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { storage } from 'src/utilities/storage';

export const useSessionExpiryToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = storage.authentication.token.get();
    const expiresAt = storage.authentication.expire.get();

    if (!token || !expiresAt || !token.toLowerCase().startsWith('admin')) {
      // Early return if a token is not in storage.
      // Also, for now, only show this toast when logged in as a customer.
      // We can consider doing this for all users.
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
