import { mount } from 'enzyme';
import * as moment from 'moment';
import * as React from 'react';

import { appTokens } from 'src/__data__/appTokens';
import { personalAccessTokens } from 'src/__data__/personalAccessTokens';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

import { APITokens } from './APITokens';

const patsAsPromise = createPromiseLoaderResponse(personalAccessTokens);
const appTokensAsPromise = createPromiseLoaderResponse(appTokens);

describe('APITokens', () => {

  const component = mount(
    <LinodeThemeWrapper>
      <APITokens
        classes={{
          headline: '',
          paper: '',
          labelCell: '',
          typeCell: '',
          createdCell: '',
        }}
        pats={patsAsPromise}
        appTokens={appTokensAsPromise}
      />
    </LinodeThemeWrapper>,
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
    expect(find.at(0).prop('data-qa-table-row')).toEqual('test-3');
    expect(find.at(1).prop('data-qa-table-row')).toEqual('test-2');
    expect(find.at(2).prop('data-qa-table-row')).toEqual('test-4');
    expect(find.at(3).prop('data-qa-table-row')).toEqual('');
    expect(find.at(4).prop('data-qa-table-row')).toEqual('test-app-3');
    expect(find.at(5).prop('data-qa-table-row')).toEqual('test-app-2');

  });
});

describe('create and edit tokens', () => {
  const pats = createPromiseLoaderResponse<Linode.Token[]>([
    {
      created: '2018-04-09T20:00:00',
      expiry: moment.utc().subtract(1, 'day').format(),
      id: 1,
      token: 'aa588915b6368b80',
      scopes: 'account:read_write',
      label: 'test-1',
    },
  ]);

  const component = mount(
    <LinodeThemeWrapper>
      <APITokens
        classes={{
          headline: '',
          paper: '',
          labelCell: '',
          typeCell: '',
          createdCell: '',
        }}
        pats={pats}
        appTokens={appTokensAsPromise}
      />
    </LinodeThemeWrapper>,
  );

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('create token submit form should return false if label is blank', () => {
    (component.instance() as APITokens).createToken('*');
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('edit token submit form should return false if label is blank', () => {
    (component.instance() as APITokens).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeTruthy();
  });

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('create token submit form should return no error state if label exists', () => {
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

  /* Skipping until we can figure out how to call instance methods on nested component */
  it.skip('edit token submit form should return no error state if label exists', () => {
    (component.instance() as APITokens).editToken();
    const errorsExist = (!!component.state().form.errors);
    expect(errorsExist).toBeFalsy();
  });
});
