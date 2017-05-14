import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import CreatePersonalAccessToken from '~/profile/integrations/components/CreatePersonalAccessToken';
import { SHOW_MODAL } from '~/actions/modal';
import { expectDispatchOrStoreErrors, expectRequest } from '@/common';

describe('profile/integrations/components/CreatePersonalAccessToken', () => {
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

    const changeInput = (id, value) =>
      page.find({ id, name: id }).props().onChange({ target: { value, name: id } });

    changeInput('label', 'My sweet new token');

    await page.props().onSubmit();

    // TODO: this doesn't work like this     dispatch.returns({ token: 'the-secret' });
    // One call to save the data, one call to show secret.
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/tokens/', {
        method: 'POST',
        body: {
          label: 'My sweet new token',
          // Can't actually check on expiry because it's based off of $NOW which
          // leads to test failure
        },
      }),
      ([{ type }]) => expect(type).to.equal(SHOW_MODAL),
    ], 2);
  });
});
