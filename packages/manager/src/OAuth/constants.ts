import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

const DEFAULT_APP_ROOT = 'http://localhost:3000';
const DEFAULT_LOGIN_ROOT = 'https://login.linode.com';

/**
 * Use this as the source of truth for getting the login server's root URL.
 *
 * Specify a `REACT_APP_LOGIN_ROOT` in your environment to set this value.
 *
 * In local dev, this URL may be pulled from localstorage to allow for environment switching.
 *
 * @returns The Login server's root URL
 * @default https://login.linode.com
 */
export function getLoginURL() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  return (
    localStorageOverrides?.loginRoot ??
    import.meta.env.REACT_APP_LOGIN_ROOT ??
    DEFAULT_LOGIN_ROOT
  );
}

/**
 * Use this as the source of truth for getting the app's client id.
 *
 * `REACT_APP_CLIENT_ID` is required for the app to function
 *
 * You can generate a client id by navigating to https://cloud.linode.com/profile/clients
 *
 * In local dev, a CLIENT_ID may be pulled from localstorage to allow for environment switching.
 */
export function getClientId() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  const clientId =
    localStorageOverrides?.clientID ?? import.meta.env.REACT_APP_CLIENT_ID;

  if (!clientId) {
    throw new Error('No CLIENT_ID specified.');
  }

  return clientId;
}

/**
 * Use this as the source of truth for getting the app's root URL.
 *
 * Specify a `REACT_APP_APP_ROOT` in your environment to set this value.
 *
 * @returns The apps root URL
 * @default http://localhost:3000
 */
export function getAppRoot() {
  return import.meta.env.REACT_APP_APP_ROOT ?? DEFAULT_APP_ROOT;
}
