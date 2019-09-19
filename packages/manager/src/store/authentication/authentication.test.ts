import store from 'src/store';
import { authentication } from 'src/utilities/storage';
import {
  handleInitTokens,
  handleLogout,
  handleStartSession
} from './authentication.actions';

describe('Authentication', () => {
  authentication.expire.set('hello world');
  authentication.nonce.set('hello world');
  authentication.scopes.set('hello world');
  authentication.token.set('hello world');

  it('should set tokens when setToken is invoked', () => {
    store.dispatch(
      handleStartSession({
        token: 'helloworld',
        scopes: '*',
        expires: 'never'
      })
    );
    expect(store.getState().authentication).toEqual({
      token: 'helloworld',
      scopes: '*',
      expiration: 'never',
      loggedInAsCustomer: false
    });
  });

  it('expire() should properly expire tokens stored in local storage and redux state', () => {
    store.dispatch(
      handleStartSession({
        token: 'helloworld',
        scopes: '*',
        expires: 'never'
      })
    );
    store.dispatch(handleLogout());
    expect(authentication.expire.get()).toBe('');
    expect(authentication.nonce.get()).toBe('');
    expect(authentication.scopes.get()).toBe('');
    expect(authentication.token.get()).toBe('');
    expect(store.getState().authentication).toEqual({
      token: null,
      scopes: null,
      expiration: null,
      loggedInAsCustomer: false
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
      token: 'Admin',
      scopes: 'hello world',
      expiration: 'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)',
      loggedInAsCustomer: true
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
      token: 'bearer',
      scopes: 'hello world',
      expiration: 'Thu Apr 11 3000 11:48:04 GMT-0400 (Eastern Daylight Time)',
      loggedInAsCustomer: false
    });
  });
});
