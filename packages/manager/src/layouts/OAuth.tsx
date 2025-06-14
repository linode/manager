import { capitalize, getQueryParamsFromQueryString } from '@linode/utilities';
import * as React from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import {
  clearAuthDataFromLocalStorage,
  clearNonceAndCodeVerifierFromLocalStorage,
  setAuthDataInLocalStorage,
} from 'src/OAuth/utils';
import {
  authentication,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

const localStorageOverrides = getEnvLocalStorageOverrides();
const loginURL = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;
const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;

export type OAuthQueryParams = {
  code: string;
  returnTo: string;
  state: string; // nonce
};

export const OAuthCallbackPage = ({
  history,
  location,
}: RouteComponentProps) => {
  const checkNonce = (nonce: string) => {
    // nonce should be set and equal to ours otherwise retry auth
    const storedNonce = authentication.nonce.get();
    authentication.nonce.set('');
    if (!(nonce && storedNonce === nonce)) {
      clearStorageAndRedirectToLogout();
    }
  };

  const createFormData = (
    clientID: string,
    code: string,
    nonce: string,
    codeVerifier: string
  ): FormData => {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', clientID);
    formData.append('code', code);
    formData.append('state', nonce);
    formData.append('code_verifier', codeVerifier);
    return formData;
  };

  const exchangeAuthorizationCodeForToken = async (
    code: string,
    returnTo: string,
    nonce: string
  ) => {
    try {
      const expireDate = new Date();
      const codeVerifier = authentication.codeVerifier.get();

      if (codeVerifier) {
        authentication.codeVerifier.set('');

        /**
         * We need to validate that the nonce returned (comes from the location query param as the state param)
         * matches the one we stored when authentication was started. This confirms the initiator
         * and receiver are the same.
         */
        checkNonce(nonce);

        const formData = createFormData(
          `${clientID}`,
          code,
          nonce,
          codeVerifier
        );

        const response = await fetch(`${loginURL}/oauth/token`, {
          body: formData,
          method: 'POST',
        });

        if (response.ok) {
          const tokenParams = await response.json();

          /**
           * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
           * the API returns the expiry time in seconds
           */

          expireDate.setTime(
            expireDate.getTime() + +tokenParams.expires_in * 1000
          );

          setAuthDataInLocalStorage({
            token: `${capitalize(tokenParams.token_type)} ${tokenParams.access_token}`,
            scopes: tokenParams.scopes,
            expires: expireDate.toString(),
          });

          /**
           * All done, redirect this bad-boy to the returnTo URL we generated earlier.
           */
          history.push(returnTo);
        } else {
          clearStorageAndRedirectToLogout();
        }
      } else {
        clearStorageAndRedirectToLogout();
      }
    } catch (error) {
      clearStorageAndRedirectToLogout();
    }
  };

  React.useEffect(() => {
    if (!location.search || location.search.length < 2) {
      clearStorageAndRedirectToLogout();
      return;
    }

    const {
      code,
      returnTo,
      state: nonce,
    } = getQueryParamsFromQueryString(location.search);

    if (!code || !returnTo || !nonce) {
      clearStorageAndRedirectToLogout();
      return;
    }

    exchangeAuthorizationCodeForToken(code, returnTo, nonce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SplashScreen />;
};

const clearStorageAndRedirectToLogout = () => {
  clearLocalStorage();
  window.location.assign(loginURL + '/logout');
};

const clearLocalStorage = () => {
  clearNonceAndCodeVerifierFromLocalStorage();
  clearAuthDataFromLocalStorage();
};

export default OAuthCallbackPage;
