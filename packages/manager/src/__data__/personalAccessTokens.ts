import { DateTime } from 'luxon';
import { Token } from '@linode/api-v4/lib/profile';

export const personalAccessTokens: Token[] = [
  {
    created: '2018-04-09T20:00:00',
    expiry: DateTime.utc()
      .minus({ days: 1 })
      .toISO(),
    id: 1,
    token: 'aa588915b6368b80',
    scopes: 'account:read_write',
    label: 'test-1',
  },
  {
    created: '2017-04-09T20:00:00',
    expiry: DateTime.utc()
      .plus({ months: 3 })
      .toISO(),
    id: 2,
    token: 'ae8adb9a37263b4d',
    scopes: 'account:read_only',
    label: 'test-2',
  },
  {
    created: '2018-04-09T20:00:00',
    expiry: DateTime.utc()
      .plus({ years: 1 })
      .toISO(),
    id: 3,
    token: '019774b077bb5fda',
    scopes: 'account:read_write',
    label: 'test-3',
  },
  {
    created: '2011-04-09T20:00:00',
    expiry: DateTime.utc()
      .plus({ years: 1 })
      .toISO(),
    id: 4,
    token: '019774b077bb5fda',
    scopes: 'account:read_write',
    label: 'test-4',
  },
];
