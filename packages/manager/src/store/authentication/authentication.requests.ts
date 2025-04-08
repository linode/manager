import { LOGIN_ROOT } from 'src/constants';
import { revokeToken } from 'src/session';
import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

import { handleLogout as _handleLogout } from './authentication.actions';

import type { RevokeTokenSuccess } from 'src/session';
import type { ThunkActionCreator } from 'src/store/types';

/**
 * Revokes auth token used to make HTTP requests
 *
 * @param { string } client_id - the ID of the client app
 * @param { string } token - the auth token used to make HTTP requests
 *
 */
export const handleLogout: ThunkActionCreator<
  Promise<RevokeTokenSuccess>,
  {
    client_id: string;
    token: string;
  }
> = ({ client_id, token }) => (dispatch) => {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  let loginURL;
  try {
    loginURL = new URL(localStorageOverrides?.loginRoot ?? LOGIN_ROOT);
  } catch (_) {
    loginURL = LOGIN_ROOT;
  }

  return revokeToken(client_id, token)
    .then((response) => {
      dispatch(_handleLogout());

      /** send the user back to login */
      window.location.assign(`${loginURL}/logout`);
      return response;
    })
    .catch((err) => {
      dispatch(_handleLogout());
      /** send the user back to login */
      window.location.assign(`${loginURL}/logout`);
      return err;
    });
};
