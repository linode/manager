import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { setAuthToken } from 'src/utilities/authentication';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { authentication } from 'src/utilities/storage';

import type { BaseQueryParams } from 'src/utilities/queryParams';

export interface OAuthQueryParams extends BaseQueryParams {
  access_token: string; // token for auth
  expires_in: string; // amount of time (in seconds) the token has before expiry
  return: string;
  scope: string;
  state: string; // nonce
  token_type: string; // token prefix AKA "Bearer"
}

const checkNonce = (nonce: string, history: ReturnType<typeof useHistory>) => {
  // nonce should be set and equal to ours otherwise retry auth
  const storedNonce = authentication.nonce.get();
  if (!(nonce && storedNonce === nonce)) {
    authentication.nonce.set('');
    history.push('/');
  }
};

const OAuthCallback = () => {
  /**
   * If this URL doesn't have a fragment, or doesn't have enough entries, we know we don't have
   * the data we need and should bounce.
   * location.hash is a string which starts with # and is followed by a basic query params stype string.
   *
   * 'location.hash = `#access_token=something&token_type=something˙&expires_in=something&scope=something&state=something&return=the-url-we-are-now-at?returnTo=where-to-redirect-when-done`
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

    const hashParams = getQueryParamsFromQueryString<OAuthQueryParams>(
      location.hash.substring(1)
    );

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      scope: scopes,
      state: nonce,
      token_type: tokenType,
    } = hashParams;

    /** If the access token wasn't returned, something is wrong and we should bail. */
    if (!accessToken) {
      return history.push('/');
    }

    /**
     * Build the path we're going to redirect to after we're done (back to where the user was when they started authentication).
     * This has to be handled specially; the hashParams object above already has a "return" property, but query parsers
     * don't handle URLs as query params very well. Any query params in the returnTo URL will be parsed as if they were separate params.
     */

    // Find the returnTo= param directly
    const returnIdx = location.hash.indexOf('returnTo');
    // If it exists, take everything after its index (plus 9 to remove the returnTo=)
    const returnPath = returnIdx ? location.hash.substr(returnIdx + 9) : null;
    // If this worked, we have a return URL. If not, default to the root path.
    const returnTo = returnPath ?? '/';

    /**
     * We need to validate that the nonce returned (comes from the location.hash as the state param)
     * matches the one we stored when authentication was started. This confirms the initiator
     * and receiver are the same.
     */
    checkNonce(nonce, history);

    /**
     * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
     * the API returns the expiry time in seconds
     */
    const expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + +expiresIn * 1000);

    /**
     * We have all the information we need and can persist it to localStorage and Redux.
     */
    setAuthToken({
      expiration: expireDate.toString(),
      scopes,
      token: `${tokenType} ${accessToken}`,
    });

    /**
     * All done, redirect this bad-boy to the returnTo URL we generated earlier.
     */
    history.push(returnTo);
  }, []);

  return null;
};

export default OAuthCallback;
