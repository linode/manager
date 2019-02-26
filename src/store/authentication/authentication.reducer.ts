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
  expiration: null
};

const {
  token: tokenInLocalStorage,
  scopes: scopesInLocalStorage,
  expire: expiryInLocalStorage
} = authentication;

const reducer = reducerWithInitialState(defaultState)
  .caseWithAction(handleStartSession, (state, action) => {
    const { scopes, token, expires } = action.payload;

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
    const expiryTime = expiryInLocalStorage.get();
    if (expiryTime && new Date(expiryTime) < new Date()) {
      clearLocalStorage();
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
    return {
      ...state,
      token,
      scopes,
      expiration: expiryTime
    };
  })
  .cases([handleExpireTokens, handleLogout], state => {
    /** clear local storage and redux state - plain and simple */
    clearLocalStorage();
    return {
      ...state,
      scopes: null,
      token: null,
      expiration: null
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
