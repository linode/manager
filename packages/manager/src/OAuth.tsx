import { useEffect, useState } from 'react';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { CLIENT_ID, LOGIN_ROOT } from './constants';
import { getEnvLocalStorageOverrides } from './utilities/storage';

const localStorageOverrides = getEnvLocalStorageOverrides();
export const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;
export const loginRoot = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;

export const LOGIN_URL = `${loginRoot}/oauth/authorize`;

export const REDIRECT_URL = `http://localhost:3000/oauth/callback`;

export const SCOPE = '*';

export const RESPONSE_TYPE = 'token';

export function OAuth() {
  const history = useHistory();

  useEffect(() => {
    // When the OAuth route is mounted...

    // Prase query params and get relevent data such as access_token and expires_in
    const url = new URLSearchParams(window.location.href);
    const data = Array.from(url.entries());
    const token = data.find((entry) => entry[0].includes('access_token'))?.[1];
    const expires_in = url.get('expires_in');

    if (!token || !expires_in) {
      return;
    }

    const expiresIn = Number(expires_in) * 1000;
    const expiresAt = Date.now() + expiresIn;

    // Make app reauth when token is set to expire
    setTimeout(() => {
      localStorage.removeItem('authentication/expire');
      localStorage.removeItem('authentication/token');
      window.location.href = encodeURI(
        `${LOGIN_URL}?response_type=token&client_id=${clientID}&state=xyz&redirect_uri=${REDIRECT_URL}&scope=${SCOPE}`
      );
    }, expiresIn);

    // Store token and expire time in localstorage
    localStorage.setItem('authentication/token', `Bearer ${token}`);
    localStorage.setItem('authentication/expire', String(expiresAt));

    // Go home
    history.replace('/');
  }, []);

  return <div>loading</div>;
}

export function useOAuth() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authentication/token');
    const hasToken = token !== null;
    const expiresAt = Number(localStorage.getItem('authentication/expire'));

    // If we initialize the app with the /callback url, we need to render routes but do no processing.
    if (location.pathname.includes('/callback')) {
      setIsLoading(false);
      return;
    }

    // When we initialize the app...
    if (hasToken && expiresAt > Date.now()) {
      // If we have an auth token that is not expired...
      // Make app redirect to auth when token expires
      setTimeout(() => {
        localStorage.removeItem('authentication/expire');
        localStorage.removeItem('authentication/token');
        window.location.href = encodeURI(
          `${LOGIN_URL}?response_type=token&client_id=${clientID}&state=xyz&redirect_uri=${REDIRECT_URL}&scope=${SCOPE}`
        );
      }, expiresAt - Date.now());

      // Set the @linode/api-v4 token and render the app
      setIsLoading(false);
      return;
    }

    // if we have mde it here, we need to authenticate
    window.location.href = encodeURI(
      `${LOGIN_URL}?response_type=token&client_id=${clientID}&state=xyz&redirect_uri=${REDIRECT_URL}&scope=${SCOPE}`
    );
  }, []);

  return { isLoading };
}
