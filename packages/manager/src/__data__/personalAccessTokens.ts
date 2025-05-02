import { DateTime } from 'luxon';

import type { Token } from '@linode/api-v4/lib/profile';

export const personalAccessTokens: Token[] = [
  {
    created: '2018-04-09T20:00:00',
    expiry: DateTime.utc().minus({ days: 1 }).toISO(),
    id: 1,
    label: 'test-1',
    scopes: 'account:read_write',
    token: 'aa588915b6368b80',
  },
  {
    created: '2017-04-09T20:00:00',
    expiry: DateTime.utc().plus({ months: 3 }).toISO(),
    id: 2,
    label: 'test-2',
    scopes: 'account:read_only',
    token: 'ae8adb9a37263b4d',
  },
  {
    created: '2018-04-09T20:00:00',
    expiry: DateTime.utc().plus({ years: 1 }).toISO(),
    id: 3,
    label: 'test-3',
    scopes: 'account:read_write',
    token: '019774b077bb5fda',
  },
  {
    created: '2011-04-09T20:00:00',
    expiry: DateTime.utc().plus({ years: 1 }).toISO(),
    id: 4,
    label: 'test-4',
    scopes: 'account:read_write',
    token: '019774b077bb5fda',
  },
];
