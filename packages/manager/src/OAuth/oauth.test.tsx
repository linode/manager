import { http, HttpResponse, server } from 'src/mocks/testServer';
import { storage } from 'src/utilities/storage';

import {
  generateOAuthAuthorizeEndpoint,
  getIsLoggedInAsCustomer,
  handleLoginAsCustomerCallback,
  handleOAuthCallback,
  logout,
} from './oauth';

import type { TokenResponse } from './types';

describe('getIsLoggedInAsCustomer', () => {
  it('returns true if an Admin token is stored', () => {
    storage.authentication.token.set(
      'Admin d245a30e8fe88dce34f44772bf922d94b606fe6thisisfakesodontcomplaindf51ce87f7e68'
    );

    expect(getIsLoggedInAsCustomer()).toBe(true);
  });

  it('returns false if a Bearer token is stored', () => {
    storage.authentication.token.set(
      'Bearer d245a30e8fe88dce34f44772bf922d94b606fe6thisisfakesodontcomplaindf51c8ea87df'
    );

    expect(getIsLoggedInAsCustomer()).toBe(false);
  });
});

describe('generateOAuthAuthorizeEndpoint', () => {
  beforeAll(() => {
    vi.stubEnv('REACT_APP_APP_ROOT', 'https://cloud.fake.linode.com');
    vi.stubEnv('REACT_APP_LOGIN_ROOT', 'https://login.fake.linode.com');
    vi.stubEnv('REACT_APP_CLIENT_ID', '9l424eefake9h4fead4d09');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('includes the CLIENT_ID from the env', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).toContain('client_id=9l424eefake9h4fead4d09');
  });

  it('includes the LOGIN_ROOT from the env', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).not.toBeNull();
    expect(url!.startsWith('https://login.fake.linode.com')).toBe(true);
  });

  it('includes the redirect_uri based on the APP_ROOT from the env and the returnTo path', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).toContain(
      'redirect_uri=https%3A%2F%2Fcloud.fake.linode.com%2Foauth%2Fcallback%3FreturnTo%3D%2Flinodes'
    );
  });

  it('includes the expected code_challenge_method', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).toContain('code_challenge_method=S256');
  });

  it('includes the expected respone_type', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).toContain('response_type=code');
  });

  it('includes a code_challenge', async () => {
    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    expect(url).toContain('code_challenge=');
  });

  it('generates a "state" (aka nonce), stores it in local storage, and includes it in the url', async () => {
    storage.authentication.nonce.clear();

    expect(storage.authentication.nonce.get()).toBeNull();

    const url = await generateOAuthAuthorizeEndpoint('/linodes');

    const nonceInStorage = storage.authentication.nonce.get();

    expect(nonceInStorage).toBeDefined();
    expect(url).toContain(`state=${nonceInStorage}`);
  });

  it('generates a code verifier and stores it in local storage', async () => {
    storage.authentication.codeVerifier.clear();

    expect(storage.authentication.codeVerifier.get()).toBeNull();

    await generateOAuthAuthorizeEndpoint('/linodes');

    const codeVerifierInStorage = storage.authentication.codeVerifier.get();

    expect(codeVerifierInStorage).toBeDefined();
  });
});

describe('handleOAuthCallback', () => {
  beforeAll(() => {
    vi.stubEnv('REACT_APP_CLIENT_ID', 'fgejgjefejhg');
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('should throw if the callback search params are empty', async () => {
    await expect(handleOAuthCallback({ params: '' })).rejects.toThrowError(
      'Error parsing search params on OAuth callback.'
    );
  });

  it('should throw if the callback search params are not valid (the "state" param is missing)', async () => {
    await expect(
      handleOAuthCallback({
        params: '?returnTo=%2F&code=42ddf75dfa2cacbad897',
      })
    ).rejects.toThrowError('Error parsing search params on OAuth callback.');
  });

  it('should throw if there is no code verifier found in local storage', async () => {
    storage.authentication.codeVerifier.clear();

    await expect(
      handleOAuthCallback({
        params: 'state=fehgefhgkefghk&code=gyuwyutfetyfew',
      })
    ).rejects.toThrowError(
      'No code codeVerifier found in local storage when running OAuth callback.'
    );
  });

  it('should throw if there is no nonce found in local storage', async () => {
    storage.authentication.codeVerifier.set('fakecodeverifier');
    storage.authentication.nonce.clear();

    await expect(
      handleOAuthCallback({
        params: 'state=fehgefhgkefghk&code=gyuwyutfetyfew',
      })
    ).rejects.toThrowError(
      'No nonce found in local storage when running OAuth callback.'
    );
  });

  it('should throw if the nonce in local storage does not match the "state" sent back by login', async () => {
    storage.authentication.codeVerifier.set('fakecodeverifier');
    storage.authentication.nonce.set('fakenonce');

    await expect(
      handleOAuthCallback({
        params: 'state=incorrectnonce&code=gyuwyutfetyfew',
      })
    ).rejects.toThrowError(
      'Stored nonce is not the same nonce as the one sent by login.'
    );
  });

  it('should throw if the request to /oauth/token was unsuccessful', async () => {
    storage.authentication.codeVerifier.set('fakecodeverifier');
    storage.authentication.nonce.set('fakenonce');

    server.use(
      http.post('*/oauth/token', () => {
        return HttpResponse.json(
          { error: 'Login server error.' },
          { status: 500 }
        );
      })
    );

    await expect(
      handleOAuthCallback({
        params: 'state=fakenonce&code=gyuwyutfetyfew',
      })
    ).rejects.toThrowError('Request to POST /oauth/token was not ok.');
  });

  it('should throw if the /oauth/token response is not valid JSON', async () => {
    storage.authentication.codeVerifier.set('fakecodeverifier');
    storage.authentication.nonce.set('fakenonce');

    server.use(
      http.post('*/oauth/token', () => {
        return HttpResponse.xml(`<user name="John" />`);
      })
    );

    await expect(
      handleOAuthCallback({
        params: 'state=fakenonce&code=gyuwyutfetyfew',
      })
    ).rejects.toThrowError(
      'Unable to parse the response of POST /oauth/token as JSON.'
    );
  });

  it('should store an auth token and return data if the request to /oauth/token was successful', async () => {
    storage.authentication.codeVerifier.set('fakecodeverifier');
    storage.authentication.nonce.set('fakenonce');
    storage.authentication.token.clear();

    const tokenResponse: TokenResponse = {
      access_token: 'fakeaccesstoken',
      expires_in: 7200,
      refresh_token: null,
      scopes: '*',
      token_type: 'bearer',
    };

    server.use(
      http.post('*/oauth/token', () => {
        return HttpResponse.json(tokenResponse);
      })
    );

    const result = await handleOAuthCallback({
      params: 'state=fakenonce&code=gyuwyutfetyfew&returnTo=/profile',
    });

    expect(storage.authentication.token.get()).toBe('Bearer fakeaccesstoken');

    expect(result).toStrictEqual({
      returnTo: '/profile',
      expiresIn: 7200,
    });
  });
});

describe('handleLoginAsCustomerCallback', () => {
  it('should throw if the callback hash params are empty', async () => {
    await expect(
      handleLoginAsCustomerCallback({ params: '' })
    ).rejects.toThrowError(
      'Unable to login as customer. Admin did not send expected params in location hash.'
    );
  });

  it('should throw if any of the callback hash params are invalid (expires_in is not a number)', async () => {
    await expect(
      handleLoginAsCustomerCallback({
        params:
          'access_token=fjhwehkfg&destination=dashboard&expires_in=invalidexpire&token_type=Admin',
      })
    ).rejects.toThrowError(
      'Unable to login as customer. Admin did not send expected params in location hash.'
    );
  });

  it('should throw if any of the callback hash params are invalid (access_token is missing in the params)', async () => {
    await expect(
      handleLoginAsCustomerCallback({
        params:
          'destination=dashboard&expires_in=invalidexpire&token_type=Admin',
      })
    ).rejects.toThrowError(
      'Unable to login as customer. Admin did not send expected params in location hash.'
    );
  });

  it('should set the token in local storage and return data if there are no errors', async () => {
    storage.authentication.token.clear();

    const result = await handleLoginAsCustomerCallback({
      params:
        'access_token=fakeadmintoken&destination=dashboard&expires_in=100&token_type=Admin',
    });

    expect(result).toStrictEqual({ expiresIn: 100, returnTo: '/dashboard' });
    expect(storage.authentication.token.get()).toBe(`Admin fakeadmintoken`);
  });
});

describe('logout', () => {
  beforeAll(() => {
    vi.stubEnv('REACT_APP_LOGIN_ROOT', 'https://login.fake.linode.com');
    vi.stubEnv('REACT_APP_CLIENT_ID', '9l424eefake9h4fead4d09');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('clears the auth token', async () => {
    storage.authentication.token.set('Bearer faketoken');

    await logout();

    expect(storage.authentication.token.get()).toBeNull();
  });

  it('makes an API call to login to revoke the token', async () => {
    storage.authentication.token.set('Bearer faketoken');

    const onRevoke = vi.fn();

    server.use(
      http.post('*/oauth/revoke', async (data) => {
        const payload = await data.request.text();
        onRevoke(payload);
      })
    );

    await logout();

    expect(onRevoke).toHaveBeenCalledWith(
      'client_id=9l424eefake9h4fead4d09&token=faketoken'
    );
  });
});
