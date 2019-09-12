import { stringify } from 'querystring';
import { LOGIN_ROOT } from 'src/constants';
import Request, { setData, setHeaders, setMethod, setURL } from 'src/request';
import { Success } from './types';

/**
 * Revokes auth token used to make HTTP requests
 *
 * @param { string } client_id - the ID of the client app
 * @param { string } token - the auth token used to make HTTP requests
 *
 */
export const revokeToken = (client_id: string, token: string) =>
  Request<Success>(
    setURL(`${LOGIN_ROOT}/oauth/revoke`),
    setMethod('POST'),
    setData(
      stringify({
        client_id,
        token
      })
    ),
    setHeaders({
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    })
  ).then(response => response.data);

export { Success };
