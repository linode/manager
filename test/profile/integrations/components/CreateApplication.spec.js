import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import CreateApplication from '~/profile/integrations/components/CreateApplication';
import { expectRequest } from '@/common';

describe('profile/integrations/components/CreateApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('creates a new application', async () => {
    const page = shallow(
      <CreateApplication
        dispatch={dispatch}
        close={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('name', 'My new client');
    changeInput('redirect', 'http://example.com');

    await page.props().onSubmit();

    // One call to save the data, one call to close.
    expect(dispatch.callCount).to.equal(2);

    const fn = dispatch.firstCall.args[0];
    dispatch.reset();
    dispatch.returns({ json: () => ({}) });
    expectRequest(fn, '/account/profile/clients', dispatch, undefined, {
      method: 'POST',
      body: {
        name: 'My new client',
        redirect_uri: 'http://example.com',
      },
    });
  });
});
