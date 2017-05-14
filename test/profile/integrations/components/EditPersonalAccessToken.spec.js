import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import EditPersonalAccessToken from '~/profile/integrations/components/EditPersonalAccessToken';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testToken } from '@/data/tokens';

describe('profile/integrations/components/EditPersonalAccessToken', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('modifies a token', async () => {
    const close = sandbox.spy();
    const page = shallow(
      <EditPersonalAccessToken
        dispatch={dispatch}
        close={close}
        label={testToken.label}
        id={testToken.id}
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My awesome token');

    await page.props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/account/tokens/${testToken.id}`, {
        method: 'PUT',
        body: {
          label: 'My awesome token',
        },
      }),
    ], 2);

    expect(close.callCount).to.equal(1);
  });
});
