import * as moment from 'moment';

export const appTokens: Linode.Token[] = [
  {
    created: '2018-04-26T20:00:00',
    expiry: moment
      .utc()
      .subtract(1, 'day')
      .format(),
    thumbnail_url: null,
    id: 1,
    scopes: '*',
    website: 'http://localhost:3000',
    label: 'test-app-1'
  },
  {
    created: '2015-04-26T14:45:07',
    expiry: moment
      .utc()
      .add(1, 'day')
      .format(),
    thumbnail_url: null,
    id: 2,
    scopes: '*',
    website: 'http://localhost:3000',
    label: 'test-app-2'
  },
  {
    created: '2017-04-26T14:45:07',
    expiry: moment
      .utc()
      .add(3, 'months')
      .format(),
    thumbnail_url: null,
    id: 3,
    scopes: '*',
    website: 'http://localhost:3000',
    label: 'test-app-3'
  },
  {
    created: '2011-04-26T14:45:07',
    expiry: moment
      .utc()
      .add(3, 'months')
      .format(),
    thumbnail_url: null,
    id: 4,
    scopes: '*',
    website: 'http://localhost:3000',
    label: 'test-app-4'
  },
  {
    created: '2028-04-26T14:45:07',
    expiry: moment
      .utc()
      .add(3, 'months')
      .format(),
    thumbnail_url: null,
    id: 5,
    scopes: '*',
    website: 'http://localhost:3000',
    label: ''
  }
];
