import { authentication } from 'src/utilities/storage';

import { storeFactory } from '..';
import {
  handleInitTokens,
  handleLogout,
  handleStartSession,
} from './authentication.actions';

const store = storeFactory();

describe('Authentication', () => {
  authentication.expire.set('hello world');
  authentication.nonce.set('hello world');
  authentication.codeVerifier.set('hello world');
  authentication.scopes.set('hello world');
  authentication.token.set('hello world');

  it('should set tokens when setToken is invoked', () => {
    store.dispatch(
      handleStartSession({
        expires: 'never',
        scopes: '*',
        token: 'helloworld',
      })
    );
    expect(store.getState().authentication).toEqual({
      expiration: 'never',
      loggedInAsCustomer: false,
      scopes: '*',
      token: 'helloworld',
    });
  });

  it('expire() should properly expire tokens stored in local storage and redux state', () => {
    store.dispatch(
      handleStartSession({
        expires: 'never',
        scopes: '*',
        token: 'helloworld',
      })
    );
    store.dispatch(handleLogout());
    expect(authentication.expire.get()).toBe('');
    expect(authentication.nonce.get()).toBe('hello world');
    expect(authentication.codeVerifier.get()).toBe('hello world');
    expect(authentication.scopes.get()).toBe('');
    expect(authentication.token.get()).toBe('');
    expect(store.getState().authentication).toEqual({
      expiration: null,
      loggedInAsCustomer: false,
      scopes: null,
      token: null,
    });
  });

  it('should set loggedInAsCustomer to true if token contains "admin"', () => {
    authentication.expire.set(
      'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)'
    );
    authentication.nonce.set('hello world');
    authentication.scopes.set('hello world');
    authentication.token.set('Admin');

    store.dispatch(handleInitTokens());

    expect(store.getState().authentication).toEqual({
      expiration: 'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)',
      loggedInAsCustomer: true,
      scopes: 'hello world',
      token: 'Admin',
    });
  });

  it('should set loggedInAsCustomer to false if token does not contain "admin"', () => {
    authentication.expire.set(
      'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)'
    );
    authentication.nonce.set('hello world');
    authentication.scopes.set('hello world');
    authentication.token.set('bearer');

    store.dispatch(handleInitTokens());

    expect(store.getState().authentication).toEqual({
      expiration: 'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)',
      loggedInAsCustomer: false,
      scopes: 'hello world',
      token: 'bearer',
    });
  });
});
