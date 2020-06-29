import { DateTime } from 'luxon';
import { filterOutLinodeApps, isWayInTheFuture } from './APITokenTable';

describe('isWayInTheFuture', () => {
  it('should return true if past 100 years in the future', () => {
    const todayPlus101Years = DateTime.local()
      .plus({ years: 101 })
      .toISO();

    expect(isWayInTheFuture(todayPlus101Years)).toBeTruthy();
  });

  it('should return false for years under 100 years in the future', () => {
    const todayPlus55Years = DateTime.local()
      .plus({ years: 55 })
      .toISO();
    expect(isWayInTheFuture(todayPlus55Years)).toBeFalsy();
  });
});

describe('filterOutLinodeApps', () => {
  it("should filter out tokens with linode's domain website", () => {
    const tokens = [
      {
        created: '2018-12-20T15:56:13',
        expiry: '2019-01-25T16:10:59',
        id: 438787,
        label: 'Linode Community Questions',
        scopes: 'events:modify',
        thumbnail_url: null
      },
      {
        created: '2018-12-20T15:56:13',
        expiry: '2019-01-25T16:10:59',
        id: 438788,
        label: 'Linode Community Questions',
        scopes: 'events:modify',
        thumbnail_url: null,
        website: 'https://www.myapp.com'
      },
      {
        created: '2018-12-20T15:56:13',
        expiry: '2019-01-25T16:10:59',
        id: 438789,
        label: 'Linode Community Questions',
        scopes: 'events:modify',
        thumbnail_url: null,
        website: 'https://www.linode.com'
      },
      {
        created: '2019-01-24T18:15:29',
        expiry: '2019-01-24T20:15:29',
        id: 523760,
        label: 'Linode Manager',
        scopes: '*',
        thumbnail_url: '/account/oauth-clients/04b4276a4094ce378d27/thumbnail',
        website: 'https://cloud.linode.com'
      },
      {
        created: '2019-01-24T18:15:29',
        expiry: '2019-01-24T20:15:29',
        id: 523761,
        label: 'Linode Manager',
        scopes: '*',
        thumbnail_url: '/account/oauth-clients/04b4276a4094ce378d27/thumbnail',
        website: 'https://cloud.linode.com'
      }
    ];
    expect(tokens.filter(filterOutLinodeApps)).toHaveLength(2);
  });
});
