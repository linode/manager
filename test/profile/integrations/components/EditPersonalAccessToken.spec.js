import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import EditPersonalAccessToken from '~/profile/integrations/components/EditPersonalAccessToken';
import { testToken } from '@/data/tokens';
import { expectRequest } from '@/common';

describe('profile/integrations/components/EditPersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('modifies a token', async () => {
    const page = shallow(
      <EditPersonalAccessToken
        dispatch={dispatch}
        close={dispatch}
        label={testToken.label}
        id={testToken.id}
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My awesome token');

    await page.props().onSubmit();

    // One call to save the data, one call to close.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/account/tokens/${testToken.id}`, {
      method: 'PUT',
      body: {
        label: 'My awesome token',
      },
    });
  });
});
