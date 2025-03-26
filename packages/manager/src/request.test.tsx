import { AxiosHeaders } from 'axios';

import { handleStartSession } from 'src/store/authentication/authentication.actions';

import { profileFactory } from './factories';
import { getURL, handleError, injectAkamaiAccountHeader } from './request';
import { storeFactory } from './store';

import type { LinodeError } from './request';
import type { APIError } from '@linode/api-v4';
import type { AxiosError, AxiosResponse } from 'axios';

const store = storeFactory();

const mockAxiosError = {
  isAxiosError: true,
  message: 'helloworld',
  name: 'requestName',
  response: {
    config: {
      headers: new AxiosHeaders({}),
    },
    data: { errors: [{ reason: 'This is a Linode error.' }] },
    headers: {},
    statusText: '',
  },
};
const baseErrorWithJson = {
  ...mockAxiosError,
  toJSON: () => mockAxiosError,
};

const error400: AxiosError<LinodeError> = {
  ...baseErrorWithJson,
  response: {
    ...mockAxiosError.response,
    status: 400,
  },
};

const error401: AxiosError<LinodeError> = {
  ...baseErrorWithJson,
  response: {
    ...mockAxiosError.response,
    status: 401,
  },
};

describe('Expiring Tokens', () => {
  it('should properly expire tokens if given a 401 error', () => {
    store.dispatch(
      handleStartSession({
        expires: 'never',
        scopes: '*',
        token: 'helloworld',
      })
    );
    const expireToken = handleError(error401, store);

    /**
     * the redux state should nulled out and the function should return
     * our original error
     */
    expect(store.getState().authentication).toEqual({
      expiration: null,
      loggedInAsCustomer: false,
      scopes: null,
      token: null,
    });
    expireToken.catch((e: APIError[]) =>
      expect(e[0].reason).toMatch(mockAxiosError.response.data.errors[0].reason)
    );
  });

  it('should just promise reject if a non-401 error', () => {
    store.dispatch(
      handleStartSession({
        expires: 'never',
        scopes: '*',
        token: 'helloworld',
      })
    );
    const expireToken = handleError(error400, store);

    /**
     * the redux state should nulled out and the function should return
     * our original error
     */
    expect(store.getState().authentication).toEqual({
      expiration: 'never',
      loggedInAsCustomer: false,
      scopes: '*',
      token: 'helloworld',
    });
    expireToken.catch((e: APIError[]) =>
      expect(e[0].reason).toMatch(mockAxiosError.response.data.errors[0].reason)
    );
  });
});

describe('getURL', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('replaces the API baseURL with the one from the environment', () => {
    const config = {
      baseURL: 'http://localhost:5000',
      url: 'http://localhost:5000/profile',
    };

    expect(getURL(config)).toBe('https://api.linode.com/v4/profile');
  });
});

describe('injectAkamaiAccountHeader', () => {
  const profile = profileFactory.build();
  const response: Partial<AxiosResponse> = {
    config: { headers: new AxiosHeaders(), method: 'get', url: '/profile' },
    data: profile,
    headers: { 'akamai-internal-account': '*' },
    status: 200,
  };

  it('injects akamai account header on successful GET profile response ', () => {
    const results = injectAkamaiAccountHeader(response as any);
    expect(results.data).toHaveProperty('_akamaiAccount', true);
    // eslint-disable-next-line
    const { _akamaiAccount, ...originalData } = results.data;
    expect(originalData).toEqual(profile);
  });

  it('returns the original profile data if no header is present', () => {
    const responseWithNoHeaders = { ...response, headers: {} };
    const results = injectAkamaiAccountHeader(responseWithNoHeaders as any);
    expect(results.data).toHaveProperty('_akamaiAccount', false);
    // eslint-disable-next-line
    const { _akamaiAccount, ...originalData } = results.data;
    expect(originalData).toEqual(profile);
  });

  it("doesn't inject the header on other endpoints", () => {
    const accountResponse = { ...response, config: { url: '/account' } };
    expect(injectAkamaiAccountHeader(accountResponse as any).data).toEqual(
      profile
    );
  });
});

describe('setupInterceptors', () => {
  it('should set the authorization header if it is explicitly set', () => {
    const config = {
      headers: {
        Authorization: 'Bearer 1234',
      },
    };

    const state = store.getState();
    const token = state.authentication?.token ?? '';

    const headers = new AxiosHeaders(config.headers);
    const hasExplicitAuthToken = headers.hasAuthorization();
    const bearer = hasExplicitAuthToken ? headers.getAuthorization() : token;

    headers.setAuthorization(bearer);

    expect(headers.getAuthorization()).toEqual('Bearer 1234');
  });
});
