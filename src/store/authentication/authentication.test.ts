import store from 'src/store';
import { authentication } from 'src/utilities/storage';
import { handleLogout, handleStartSession } from './authentication.actions';

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
      expiration: 'never'
    });
  });

  it('expire() should proerly expire tokens stored in local storage and redux state', () => {
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
      expiration: null
    });
  });
});
