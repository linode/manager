import * as React from 'react';
import { mount } from 'enzyme';
import * as moment from 'moment';

import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import { createPromiseLoaderResponse, createResourcePage } from 'src/utilities/testHelpers';

import { APITokens } from './APITokens';

describe('APITokens', () => {
  const pats: PromiseLoaderResponse<Linode.ResourcePage<Linode.Token>> =
    createPromiseLoaderResponse(createResourcePage([
      {
        created: '2018-04-09T20:00:00',
        expiry: moment.utc().subtract(1, 'day').format(),
        id: 1,
        token: 'aa588915b6368b80',
        scopes: 'account:read_write',
        label: 'test-1',
      },
      {
        created: '2018-04-09T20:00:00',
        expiry: moment.utc().add(3, 'months').format(),
        id: 2,
        token: 'ae8adb9a37263b4d',
        scopes: 'account:read_only',
        label: 'test-2',
      },
      {
        created: '2018-04-09T20:00:00',
        expiry: moment.utc().add(1, 'year').format(),
        id: 3,
        token: '019774b077bb5fda',
        scopes: 'account:read_write',
        label: 'test-3',
      },
    ]));

  const appTokens: PromiseLoaderResponse<Linode.ResourcePage<Linode.Token>> =
    createPromiseLoaderResponse(createResourcePage([
      {
        created: '2018-04-26T20:00:00',
        expiry: moment.utc().subtract(1, 'day').format(),
        thumbnail_url: null,
        id: 1,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-1',
      },
      {
        created: '2018-04-26T14:45:07',
        expiry: moment.utc().add(1, 'day').format(),
        thumbnail_url: null,
        id: 2,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-2',
      },
      {
        created: '2018-04-26T14:45:07',
        expiry: moment.utc().add(3, 'months').format(),
        thumbnail_url: null,
        id: 3,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-3',
      },
    ]));

  const component = mount(
    <APITokens
      classes={{
        headline: '',
        paper: '',
        labelCell: '',
        typeCell: '',
        createdCell: '',
      }}
      pats={pats}
      appTokens={appTokens}
    />,
  );

  it('should find a row for non-expired tokens', () => {
    expect(component.find('tr[data-qa-table-row="test-1"]').exists()).toBeFalsy();
    expect(component.find('tr[data-qa-table-row="test-2"]').exists()).toBeTruthy();
    expect(component.find('tr[data-qa-table-row="test-3"]').exists()).toBeTruthy();
    expect(component.find('tr[data-qa-table-row="test-app-1"]').exists()).toBeFalsy();
    expect(component.find('tr[data-qa-table-row="test-app-2"]').exists()).toBeTruthy();
    expect(component.find('tr[data-qa-table-row="test-app-3"]').exists()).toBeTruthy();
  });
});
