import { redirectToLogin } from 'src/session';
import { authentication } from 'src/utilities/storage';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  handleExpireTokens,
  handleInitTokens,
  handleLogout,
  handleRefreshTokens,
  handleStartSession
} from './authentication.actions';
import { clearLocalStorage } from './authentication.helpers';
import { State } from './index';

export const defaultState: State = {
  token: null,
  scopes: null,
  expiration: null,
  loggedInAsCustomer: false
};

const {
  token: tokenInLocalStorage,
  scopes: scopesInLocalStorage,
  expire: expiryInLocalStorage
} = authentication;

const reducer = reducerWithInitialState(defaultState)
  .case(handleStartSession, (state, payload) => {
    const { scopes, token, expires } = payload;

    /** set local storage */
    scopesInLocalStorage.set(scopes || '');
    tokenInLocalStorage.set(token || '');
    expiryInLocalStorage.set(expires || '');

    /** set redux state */
    return {
      ...state,
      token: token || null,
      scopes: scopes || null,
      expiration: expires || null
    };
  })
  .case(handleInitTokens, state => {
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
        token: null,
        scopes: null,
        expiration: null
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

    /** token will either be "Admin: 1234" or "Bearer: 1234" */
    const isLoggedInAsCustomer = (token || '').toLowerCase().includes('admin');

    return {
      ...state,
      token,
      scopes,
      expiration: expiryDateFromLocalStorage,
      loggedInAsCustomer: isLoggedInAsCustomer
    };
  })
  .cases([handleExpireTokens, handleLogout], state => {
    /** clear local storage and redux state - plain and simple */
    clearLocalStorage();
    return {
      ...state,
      scopes: null,
      token: null,
      expiration: null,
      loggedInAsCustomer: false
    };
  })
  .case(handleRefreshTokens, state => {
    /** get local storage values and append to redux state */
    const [localToken, localScopes, localExpiry] = (tokenInLocalStorage.get(),
    scopesInLocalStorage.get(),
    expiryInLocalStorage.get());
    return {
      ...state,
      token: localToken,
      scopes: localScopes,
      expiration: localExpiry
    };
  })
  .default(state => state);

export default reducer;
