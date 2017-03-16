import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import CreatePersonalAccessToken from '~/profile/integrations/components/CreatePersonalAccessToken';
import SelectExpiration from '~/profile/components/SelectExpiration';
import { SHOW_MODAL } from '~/actions/modal';
import { expectRequest } from '@/common';

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
    changeInput('expiry', '30');

    dispatch.returns({ token: 'the-secret' });
    await page.props().onSubmit();

    // One call to save the data, one call to show secret.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/tokens/', {
      method: 'POST',
      body: {
        label: 'My sweet new token',
        expiry: SelectExpiration.map('30'),
      },
    });

    const showModalAction = dispatch.secondCall.args[0];
    expect(showModalAction.type).to.equal(SHOW_MODAL);
  });
});
