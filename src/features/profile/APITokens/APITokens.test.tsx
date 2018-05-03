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
        created: '2017-04-09T20:00:00',
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
      {
        created: '2011-04-09T20:00:00',
        expiry: moment.utc().add(1, 'year').format(),
        id: 4,
        token: '019774b077bb5fda',
        scopes: 'account:read_write',
        label: 'test-4',
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
        created: '2015-04-26T14:45:07',
        expiry: moment.utc().add(1, 'day').format(),
        thumbnail_url: null,
        id: 2,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-2',
      },
      {
        created: '2017-04-26T14:45:07',
        expiry: moment.utc().add(3, 'months').format(),
        thumbnail_url: null,
        id: 3,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-3',
      },
      {
        created: '2011-04-26T14:45:07',
        expiry: moment.utc().add(3, 'months').format(),
        thumbnail_url: null,
        id: 4,
        scopes: '*',
        website: 'http://localhost:3000',
        label: 'test-app-4',
      },
      {
        created: '2028-04-26T14:45:07',
        expiry: moment.utc().add(3, 'months').format(),
        thumbnail_url: null,
        id: 5,
        scopes: '*',
        website: 'http://localhost:3000',
        label: '',
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

  it('should expect tokens to show in ascending order by created date', () => {
    const find = component.find('tr[data-qa-table-row]');
    expect(find.at(0).prop('data-qa-table-row')).toEqual('');
    expect(find.at(1).prop('data-qa-table-row')).toEqual('test-app-3');
    expect(find.at(2).prop('data-qa-table-row')).toEqual('test-app-2');
    expect(find.at(3).prop('data-qa-table-row')).toEqual('test-app-4');
    expect(find.at(4).prop('data-qa-table-row')).toEqual('test-3');
    expect(find.at(5).prop('data-qa-table-row')).toEqual('test-2');
  });
});

describe('create and edit tokens', () => {
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

  it('create token submit form should return false if label is blank', () => {
    (component.instance() as APITokens).createToken('*');
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  it('edit token submit form should return false if label is blank', () => {
    (component.instance() as APITokens).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  it('create token submit form should return no error state if label exists', () => {
    component.setState({
      form: {
        ...component.state().form,
        errors: undefined, // important that we reset the errors here after the previous tests
        values: {
          ...component.state().form.values,
          label: 'test label',
        },
      },
    });
    (component.instance() as APITokens).createToken('*');
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeFalsy();
  });

  it('edit token submit form should return no error state if label exists', () => {
    (component.instance() as APITokens).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeFalsy();
  });
});
