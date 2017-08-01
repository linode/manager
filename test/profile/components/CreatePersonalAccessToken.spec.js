import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { OAUTH_SCOPES } from '~/constants';
import CreatePersonalAccessToken from '~/profile/components/CreatePersonalAccessToken';
import { SHOW_MODAL } from '~/actions/modal';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('profile/components/CreatePersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('creates a new token', async () => {
    const page = shallow(
      <CreatePersonalAccessToken
        dispatch={dispatch}
        close={dispatch}
      />
    );

    changeInput(page, 'label', 'My sweet new token');
    changeInput(page, 'expiry', 0);

    await page.props().onSubmit();

    // One call to save the data, one call to show secret.
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/tokens/', {
        method: 'POST',
        body: {
          label: 'My sweet new token',
          scopes: OAUTH_SCOPES.map(scope => `${scope}:delete`).join(','),
          // Can't actually check on expiry because it's based off of $NOW which
          // leads to test failure
        },
      }),
      ([{ type, body }]) => {
        expect(type).to.equal(SHOW_MODAL);
        const modal = shallow(body);
        expect(modal.find('#secret').text()).to.equal('the-new-token');
      },
    ], 2, [{ token: 'the-new-token' }]);
  });

  it('creates a new token with no access', async () => {
    const page = shallow(
      <CreatePersonalAccessToken
        dispatch={dispatch}
        close={dispatch}
      />
    );

    changeInput(page, 'label', 'My sweet new token');
    changeInput(page, 'expiry', 0);
    OAUTH_SCOPES.forEach(scope => changeInput(page, scope, ''));

    dispatch.reset();
    await page.props().onSubmit();

    // One call to save the data, one call to show secret.
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/tokens/', {
        method: 'POST',
        body: {
          label: 'My sweet new token',
          scopes: '',
          // Can't actually check on expiry because it's based off of $NOW which
          // leads to test failure
        },
      }),
    ], 2, [{ token: 'the-new-token' }]);
  });
});
