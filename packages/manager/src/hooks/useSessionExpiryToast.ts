import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { storage } from 'src/utilities/storage';

export const useSessionExpiryToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = storage.authentication.token.get();
    const expiresAt = storage.authentication.expire.get();

    if (!token || !expiresAt || !token.toLowerCase().startsWith('admin')) {
      return;
    }

    const millisecondsUntilTokenExpires = +expiresAt - Date.now();

    // Show an expiry toast 1 minute before token expires
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
