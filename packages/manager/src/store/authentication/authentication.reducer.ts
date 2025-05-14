import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { redirectToLogin } from 'src/session';
import { authentication } from 'src/utilities/storage';

import {
  handleInitTokens,
  handleLogout,
  handleRefreshTokens,
  handleStartSession,
} from './authentication.actions';
import { clearTokenDataFromLocalStorage } from './authentication.helpers';

import type { State } from './index';

const {
  expire: expiryInLocalStorage,
  scopes: scopesInLocalStorage,
  token: tokenInLocalStorage,
} = authentication;

const defaultToken = tokenInLocalStorage.get();

/**
 * Tokens will either be "Admin 1234" or "Bearer 1234"
 */
function getIsLoggedInAsCustomer(token: string) {
  if (!token) {
    return false;
  }
  return token.toLowerCase().includes('admin');
}

export const defaultState: State = {
  expiration: expiryInLocalStorage.get(),
  loggedInAsCustomer: getIsLoggedInAsCustomer(defaultToken),
  scopes: scopesInLocalStorage.get(),
  token: defaultToken,
};

const reducer = reducerWithInitialState(defaultState)
  .case(handleStartSession, (state, payload) => {
    const { expires, scopes, token } = payload;

    /** set local storage */
    scopesInLocalStorage.set(scopes || '');
    tokenInLocalStorage.set(token || '');
    expiryInLocalStorage.set(expires || '');

    /** set redux state */
    return {
      ...state,
      expiration: expires || null,
      scopes: scopes || null,
      token: token || null,
    };
  })
  .case(handleInitTokens, (state) => {
    /**
     * if our token is expired, clear local storage
     * and redux state
     */
    const expiryDateFromLocalStorage = expiryInLocalStorage.get();
    const expiryDate = new Date(expiryDateFromLocalStorage);
    if (expiryDateFromLocalStorage && expiryDate < new Date()) {
      /**
       * the case where the user refreshes the page and has a expiry time in localstorage
       * but it's  expired
       */
      redirectToLogin(location.pathname, location.search);
      return {
        ...state,
        expiration: null,
        scopes: null,
        token: null,
      };
    }

    /**
     * otherwise just set redux state to what's in local storage
     * currently - may be null value here but that's okay
     */
    const token = tokenInLocalStorage.get();
    const scopes = scopesInLocalStorage.get();

    /** if we have no token in local storage, send us to login */
    if (!token) {
      redirectToLogin(location.pathname, location.search);
    }

    const isLoggedInAsCustomer = getIsLoggedInAsCustomer(token);

    return {
      ...state,
      expiration: expiryDateFromLocalStorage,
      loggedInAsCustomer: isLoggedInAsCustomer,
      scopes,
      token,
    };
  })
  .case(handleLogout, (state) => {
    /** clear local storage and redux state */
    clearTokenDataFromLocalStorage();

    return {
      ...state,
      expiration: null,
      loggedInAsCustomer: false,
      scopes: null,
      token: null,
    };
  })
  .case(handleRefreshTokens, (state) => {
    /** get local storage values and append to redux state */
    const [localToken, localScopes, localExpiry] =
      (tokenInLocalStorage.get(),
      scopesInLocalStorage.get(),
      expiryInLocalStorage.get());
    return {
      ...state,
      expiration: localExpiry,
      scopes: localScopes,
      token: localToken,
    };
  })
  .default((state) => state);

export default reducer;
