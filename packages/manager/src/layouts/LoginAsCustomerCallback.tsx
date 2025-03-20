/**
 * This component is similar to the OAuth component, in that it's main
 * purpose is to consume the data given from the hash params provided from
 * where the user was navigated from. In the case of this component, the user
 * was navigated from Admin and the query params differ from what they would be
 * if the user was navigated from Login. Further, we are doing no nonce checking here
 */

import { capitalize, getQueryParamsFromQueryString } from '@linode/utilities';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { setAuthToken } from 'src/utilities/authentication';

import type { BaseQueryParams } from '@linode/utilities';

interface QueryParams extends BaseQueryParams {
  access_token: string;
  destination: string;
  expires_in: string;
  token_type: string;
}

export const LoginAsCustomerCallback = () => {
  /**
   * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
   * the data we need and should bounce.
   * location.hash is a string which starts with # and is followed by a basic query params stype string.
   *
   * 'location.hash = `#access_token=something&token_type=Admin&destination=linodes/1234`
   *
   */

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    /**
     * If the hash doesn't contain a string after the #, there's no point continuing as we dont have
     * the query params we need.
     */

    if (!location.hash || location.hash.length < 2) {
      return history.push('/');
    }

    const hashParams = getQueryParamsFromQueryString<QueryParams>(
      location.hash.substr(1)
    );

    const {
      access_token: accessToken,
      destination,
      expires_in: expiresIn,
      token_type: tokenType,
    } = hashParams;

    /** If the access token wasn't returned, something is wrong and we should bail. */
    if (!accessToken) {
      return history.push('/');
    }

    /**
     * We multiply the expiration time by 1000 ms because JavaScript returns time in ms, while
     * the API returns the expiry time in seconds
     */
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + +expiresIn * 1000);

    /**
     * We have all the information we need and can persist it to localStorage and Redux.
     */
    setAuthToken({
      expiration: expireDate.toString(),
      scopes: '*',
      token: `${capitalize(tokenType)} ${accessToken}`,
    });

    /**
     * All done, redirect to the destination from the hash params
     * NOTE: the param does not include a leading slash
     */
    history.push(`/${destination}`);
  }, []);

  return null;
};
