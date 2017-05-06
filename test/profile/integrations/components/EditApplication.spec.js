import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { CreateOrEditApplication } from '~/profile/integrations/components';
import { expectRequest } from '@/common';

describe('profile/integrations/components/CreateOrEditApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('updates an application', async () => {
    const page = shallow(
      <CreateOrEditApplication
        dispatch={dispatch}
        close={dispatch}
        label="My awesome client"
        redirect="http://example.com"
        id="1"
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://google.com');

    await page.props().onSubmit();

    // One call to save the data, one call to close.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/clients/1', {
      method: 'PUT',
      body: {
        label: 'My new client',
        redirect_uri: 'http://google.com',
      },
    });
  });
});
