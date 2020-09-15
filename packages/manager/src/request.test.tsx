import { AxiosError, AxiosRequestConfig } from 'axios';
import { handleStartSession } from 'src/store/authentication/authentication.actions';
import { handleError, getURL } from './request';
import store from './store';

const baseErrorConfig: AxiosRequestConfig = {
  method: 'POST',
  headers: {}
};
const baseError = {
  config: baseErrorConfig,
  name: 'requestName',
  message: 'helloworld',
  response: {
    statusText: '',
    data: [],
    config: {},
    headers: {}
  },
  isAxiosError: true
};
const baseErrorWithJson = {
  ...baseError,
  toJSON: () => baseError
};

const error400: AxiosError = {
  ...baseErrorWithJson,
  response: {
    ...baseError.response,
    status: 400
  }
};

const error401: AxiosError = {
  ...baseErrorWithJson,
  response: {
    ...baseError.response,
    status: 401
  }
};

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
    expireToken.catch((e: AxiosError) =>
      expect(e[0].reason).toMatch(/unexpected error/)
    );
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
    expireToken.catch((e: AxiosError) =>
      expect(e[0].reason).toMatch(/unexpected error/)
    );
  });
});

describe('getURL', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('replaces the API baseURL with the one from the environment', () => {
    const config = {
      baseURL: 'http://localhost:5000',
      url: 'http://localhost:5000/profile'
    };
    process.env.API_ROOT = 'https://api.linode.com/v4';

    expect(getURL(config)).toBe('https://api.linode.com/v4/profile');
  });

  it('replaces the LOGIN baseURL with the one from the environment', () => {
    // This is kind of bogus, but necessary since the logic looks for the substring "login".
    const config = {
      baseURL: 'http://login.localhost:6000',
      url: 'http://login.localhost:6000/revoke'
    };
    process.env.LOGIN_ROOT = 'https://login.linode.com';

    // eslint-disable-next-line
    expect(getURL(config)).toBe('https://login.linode.com/revoke');
  });
});
