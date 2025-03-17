import { capitalize, getQueryParamsFromQueryString } from '@linode/utilities';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import {
  clearAuthCode,
  clearAuthToken,
  getAuthCode,
  setAuthToken,
} from 'src/utilities/authentication';
import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

const localStorageOverrides = getEnvLocalStorageOverrides();
const loginURL = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;
const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;

export type OAuthQueryParams = {
  code: string;
  returnTo?: string;
  state: string; // nonce
};

export const OAuthCallback = () => {
  const location = useLocation();
  const history = useHistory();

  React.useEffect(() => {
    /**
     * If the search doesn't contain parameters, there's no point continuing as we don't have
     * the query params we need.
     */
    if (!location.search || location.search.length < 2) {
      clearStorageAndRedirectToLogout();
    }

    /**
     * If this URL doesn't have query params, or doesn't have enough entries, we know we don't have
     * the data we need and should bounce
     */
    const { code, returnTo, state: nonce } = getQueryParamsFromQueryString(
      location.search
    ) as OAuthQueryParams;

    if (!code || !nonce) {
      clearStorageAndRedirectToLogout();
    }

    exchangeAuthorizationCodeForToken(code, nonce).then(() =>
      history.push(returnTo ?? '/')
    );
  }, []);

  return <SplashScreen />;
};

const exchangeAuthorizationCodeForToken = async (
  code: string,
  nonceFromReceiver: string
) => {
  try {
    const { codeVerifier, nonce: nonceFromInitiator } = getAuthCode();

    if (!codeVerifier) {
      throw new Error('No code verifier set');
    }

    /**
     * We need to validate that the nonce returned (comes from the location query param as the state param)
     * matches the one we stored when authentication was started. This confirms the initiator
     * and receiver are the same.
     */
    if (nonceFromReceiver !== nonceFromInitiator) {
      throw new Error('Received incorrect nonce');
    }

    const formData = createFormData(
      `${clientID}`,
      code,
      nonceFromReceiver,
      codeVerifier
    );

    const response = await fetch(`${loginURL}/oauth/token`, {
      body: formData,
      method: 'POST',
    });

    if (!response.ok) {
      throw response.statusText;
    }

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      scopes,
      token_type: tokenType,
    } = await response.json();

    /**
     * We multiply the expiration time by 1000 ms because JavaScript returns time in ms, while
     * the API returns the expiry time in seconds
     */
    setAuthToken({
      expiration: new Date(Date.now() + expiresIn * 1000).toString(),
      scopes,
      token: `${capitalize(tokenType)} ${accessToken}`,
    });
  } catch (error) {
    clearStorageAndRedirectToLogout();
  } finally {
    clearAuthCode();
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

const clearStorageAndRedirectToLogout = () => {
  clearAuthCode();
  clearAuthToken();
  window.location.assign(loginURL + '/logout');
};
