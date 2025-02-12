import { useEffect } from 'react';

import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { revokeToken } from 'src/session';
import { clearAuthToken, getAuthToken } from 'src/utilities/authentication';
import {
  clearUserInput,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

export const Logout = () => {
  useEffect(() => {
    const clientId = getEnvLocalStorageOverrides()?.clientID ?? CLIENT_ID;
    const authToken = getAuthToken().token;

    clearUserInput();
    if (clientId && authToken) {
      revokeToken(clientId, authToken.split(' ')[1]);
      clearAuthToken();
    }
    window.location.assign(getLoginUrl() + '/logout');
  }, []);

  return null;
};

const getLoginUrl = () => {
  try {
    return new URL(getEnvLocalStorageOverrides()?.loginRoot ?? LOGIN_ROOT);
  } catch (_) {
    return LOGIN_ROOT;
  }
};
