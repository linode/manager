import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import EditApplication from '~/profile/integrations/components/EditApplication';
import { expectRequest } from '@/common';

describe('profile/integrations/components/EditApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('updates an application', async () => {
    const page = shallow(
      <EditApplication
        dispatch={dispatch}
        close={dispatch}
        label="My awesome client"
        redirect="http://example.com"
        id="1"
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, label: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://google.com');

    await page.props().onSubmit();

    // One call to save the data, one call to close.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    expectRequest(fn, '/account/profile/clients/1', undefined, undefined, {
      method: 'PUT',
      body: {
        label: 'My new client',
        redirect_uri: 'http://google.com',
      },
    });
  });
});
