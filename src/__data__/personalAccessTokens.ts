import * as moment from 'moment';

export const personalAccessTokens: Linode.Token[] = [
  {
    created: '2018-04-09T20:00:00',
    expiry: moment
      .utc()
      .subtract(1, 'day')
      .format(),
    id: 1,
    token: 'aa588915b6368b80',
    scopes: 'account:read_write',
    label: 'test-1'
  },
  {
    created: '2017-04-09T20:00:00',
    expiry: moment
      .utc()
      .add(3, 'months')
      .format(),
    id: 2,
    token: 'ae8adb9a37263b4d',
    scopes: 'account:read_only',
    label: 'test-2'
  },
  {
    created: '2018-04-09T20:00:00',
    expiry: moment
      .utc()
      .add(1, 'year')
      .format(),
    id: 3,
    token: '019774b077bb5fda',
    scopes: 'account:read_write',
    label: 'test-3'
  },
  {
    created: '2011-04-09T20:00:00',
    expiry: moment
      .utc()
      .add(1, 'year')
      .format(),
    id: 4,
    token: '019774b077bb5fda',
    scopes: 'account:read_write',
    label: 'test-4'
  }
];
