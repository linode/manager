import * as React from 'react';

import { SplashScreen } from 'src/components/SplashScreen';
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { clearAuthDataFromLocalStorage, TOKEN } from 'src/OAuth/utils';
import { revokeToken } from 'src/session';
import {
  clearUserInput,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

async function logout() {
  // Clear any user input (in the Support Drawer) since the user is manually logging out.
  clearUserInput();

  const localStorageOverrides = getEnvLocalStorageOverrides();

  let loginURL;
  try {
    loginURL = new URL(localStorageOverrides?.loginRoot ?? LOGIN_ROOT);
  } catch (_) {
    loginURL = LOGIN_ROOT;
  }

  const clientId = localStorageOverrides?.clientID ?? CLIENT_ID
  const token = localStorage.getItem(TOKEN)

  clearAuthDataFromLocalStorage();

  if (clientId && token) {
    const tokenWithoutPrefix = token.split(' ')[1];
    try {
      await revokeToken(clientId, tokenWithoutPrefix);
    } catch (error) {
      // We were unable to revoke the token, but we'll send the user to
      // logout in the login app to end the session.
    }
  }

  window.location.assign(`${loginURL}/logout`);
}

export const Logout = () => {
  React.useEffect(() => {
    logout();
  }, []);

  return <SplashScreen />;
};

export default Logout;
