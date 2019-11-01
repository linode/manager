import { AxiosError } from 'axios';
import { handleStartSession } from 'src/store/authentication/authentication.actions';
import { handleError } from './request';
import store from './store';

const baseError = {
  config: {
    method: 'POST',
    headers: {}
  },
  name: 'requestName',
  message: 'helloworld',
  response: {
    statusText: '',
    data: [],
    config: {},
    headers: {}
  }
};

const error400: AxiosError = {
  ...baseError,
  response: {
    ...baseError.response,
    status: 400
  }
};

const error401: AxiosError = {
  ...baseError,
  response: {
    ...baseError.response,
    status: 401
  }
};

window.location.assign = jest.fn();

describe('Expiring Tokens', () => {
  it('should properly expire tokens if given a 401 error', () => {
    store.dispatch(
      handleStartSession({
        token: 'helloworld',
        scopes: '*',
        expires: 'never'
      })
    );
    const expireToken = handleError(error401);

    /**
     * the redux state should nulled out and the function should return
     * our original error
     */
    expect(store.getState().authentication).toEqual({
      token: null,
      scopes: null,
      expiration: null,
      loggedInAsCustomer: false
    });
    expireToken.catch((e: AxiosError) => expect(e.response!.status).toBe(401));
  });

  it('should just promise reject if a non-401 error', () => {
    store.dispatch(
      handleStartSession({
        token: 'helloworld',
        scopes: '*',
        expires: 'never'
      })
    );
    const expireToken = handleError(error400);

    /**
     * the redux state should nulled out and the function should return
     * our original error
     */
    expect(store.getState().authentication).toEqual({
      token: 'helloworld',
      scopes: '*',
      expiration: 'never',
      loggedInAsCustomer: false
    });
    expireToken.catch((e: AxiosError) => expect(e.response!.status).toBe(400));
  });
});
