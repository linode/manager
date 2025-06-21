import { profileFactory } from '@linode/utilities';
import { AxiosHeaders } from 'axios';

import { setAuthDataInLocalStorage } from './OAuth/oauth';
import { getURL, handleError, injectAkamaiAccountHeader } from './request';
import { storeFactory } from './store';
import { storage } from './utilities/storage';

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

describe('Expiring Tokens', () => {
  it('should just promise reject if a non-401 error', () => {
    setAuthDataInLocalStorage({
      expires: 'never',
      scopes: '*',
      token: 'helloworld',
    });

    const result = handleError(error400, store);

    expect(storage.authentication.token.get()).toEqual('helloworld');
    expect(storage.authentication.expire.get()).toEqual('never');
    expect(storage.authentication.scopes.get()).toEqual('*');

    result.catch((e: APIError[]) =>
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
