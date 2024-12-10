import { transformUrl } from './usePendo';

const ID_URLS = [
  {
    expectedTransform: 'https://cloud.linode.com/nodebalancers/*',
    position: 'end',
    url: 'https://cloud.linode.com/nodebalancers/123',
  },
  {
    expectedTransform:
      'https://cloud.linode.com/nodebalancers/*/configurations',
    position: 'middle',
    url: 'https://cloud.linode.com/nodebalancers/123/configurations',
  },
  {
    expectedTransform:
      'https://cloud.linode.com/nodebalancers/*/configurations/*',
    position: 'multiple',
    url: 'https://cloud.linode.com/nodebalancers/123/configurations/456',
  },
];

const USERNAME_URLS = [
  {
    path: 'my-username',
  },
  {
    path: 'my-username/profile',
  },
  {
    path: 'my-username/permissions',
  },
  {
    path: '123-my-username/profile',
  },
];

const OBJ_URLS = [
  {
    expectedTransform: 'http://cloud.linode.com/object-storage/buckets/*/*',
    path: 'us-west/abc123',
  },
  {
    expectedTransform: 'http://cloud.linode.com/object-storage/buckets/*/*/ssl',
    path: 'us-west/abc123/ssl',
  },
  {
    expectedTransform: 'http://cloud.linode.com/object-storage/buckets/*/*',
    path: 'us-west/123abc',
  },
  {
    expectedTransform:
      'http://cloud.linode.com/object-storage/buckets/*/*/access',
    path: 'us-west/123abc/access',
  },
];

describe('transformUrl', () => {
  it.each(ID_URLS)(
    'replaces id(s) in $position positions in the url path',
    ({ expectedTransform, url }) => {
      const actualTransform = transformUrl(url);
      expect(actualTransform).toEqual(expectedTransform);
    }
  );

  it.each(USERNAME_URLS)(
    'truncates $path from the /users url path',
    ({ path }) => {
      const baseUrl = 'https://cloud.linode.com/account/users/';
      const actualTransform = transformUrl(`${baseUrl}${path}`);
      expect(actualTransform).toEqual(baseUrl);
    }
  );

  it.each(OBJ_URLS)(
    'replaces the OBJ region and bucket name in the url path ($path)',
    ({ expectedTransform, path }) => {
      const baseUrl = 'http://cloud.linode.com/object-storage/buckets/';
      const actualTransform = transformUrl(`${baseUrl}${path}`);
      expect(actualTransform).toEqual(expectedTransform);
    }
  );

  it('truncates the url after "access_token" in the url path', () => {
    const url =
      'https://cloud.linode.com/oauth/callback#access_token=12345&token_type=bearer&expires_in=5678';
    const actualTransform = transformUrl(url);
    const expectedTransform =
      'https://cloud.linode.com/oauth/callback#access_token';
    expect(actualTransform).toEqual(expectedTransform);
  });

  it('returns the original url if no transformation is needed', () => {
    const url = 'https://cloud.linode.com/linodes/create';
    const actualTransform = transformUrl(url);
    expect(actualTransform).toEqual(url);
  });
});
