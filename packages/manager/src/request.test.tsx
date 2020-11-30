import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleStartSession } from 'src/store/authentication/authentication.actions';
import { profileFactory } from './factories';
import { handleError, getURL, injectEuuidToProfile } from './request';
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
});

describe('injectEuuidToProfile', () => {
  const profile = profileFactory.build();
  const response: Partial<AxiosResponse> = {
    data: profile,
    status: 200,
    config: { url: '/profile', method: 'get' },
    headers: { 'x-customer-uuid': '1234' }
  };

  it('injects the euuid on successful GET profile response ', () => {
    const results = injectEuuidToProfile(response as any);
    expect(results.data).toHaveProperty('_euuidFromHttpHeader', '1234');
    // eslint-disable-next-line
    const { _euuidFromHttpHeader, ...originalData } = results.data;
    expect(originalData).toEqual(profile);
  });

  it('returns the original profile data if no header is present', () => {
    const responseWithNoHeaders = { ...response, headers: {} };
    expect(injectEuuidToProfile(responseWithNoHeaders as any).data).toEqual(
      profile
    );
  });

  it("doesn't inject the euuid on other endpoints", () => {
    const accountResponse = { ...response, config: { url: '/account' } };
    expect(injectEuuidToProfile(accountResponse as any).data).toEqual(profile);
  });
});
