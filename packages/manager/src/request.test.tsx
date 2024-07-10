import { AxiosHeaders } from 'axios';

import { profileFactory } from './factories';
import { getURL, injectEuuidToProfile } from './request';

import type { AxiosResponse } from 'axios';

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

describe('injectEuuidToProfile', () => {
  const profile = profileFactory.build();
  const response: Partial<AxiosResponse> = {
    config: { headers: new AxiosHeaders(), method: 'get', url: '/profile' },
    data: profile,
    headers: { 'x-customer-uuid': '1234' },
    status: 200,
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
