import { storage } from 'src/utilities/storage';

import {
  generateOAuthAuthorizeEndpoint,
  getIsLoggedInAsCustomer,
} from './oauth';

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

    expect(url.startsWith('https://login.fake.linode.com')).toBe(true);
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
