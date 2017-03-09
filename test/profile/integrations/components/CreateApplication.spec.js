import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import CreateApplication from '~/profile/integrations/components/CreateApplication';
import { expectRequest } from '@/common';

describe('profile/integrations/components/CreateApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('creates a new application', async () => {
    const page = shallow(
      <CreateApplication
        dispatch={dispatch}
        close={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, label: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://example.com');
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    dispatch.returns({ json: () => ({ id: 1 }) });
    await page.props().onSubmit();

    // One call to save the data, one call to save the thumbnail, one call to close.
    expect(dispatch.callCount).to.equal(3);

    const fn = dispatch.firstCall.args[0];
    const fn2 = dispatch.secondCall.args[0];
    dispatch.reset();
    dispatch.returns({ json: () => ({}) });
    expectRequest(fn, '/account/profile/clients', dispatch, undefined, {
      method: 'POST',
      body: {
        label: 'My new client',
        redirect_uri: 'http://example.com',
      },
    });

    dispatch.reset();
    dispatch.returns({ json: () => ({}) });
    expectRequest(fn2, '/account/profile/clients/1/thumbnail', dispatch, undefined, {
      method: 'PUT',
      body: thumbnail,
    });
  });

  it('fails on a larger file', async () => {
    const page = shallow(
      <CreateApplication
        dispatch={dispatch}
        close={dispatch}
      />
    );

    const changeInput = (id, value) =>
      page.find('Input').find({ id }).simulate('change', { target: { value, label: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://example.com');
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    dispatch.returns({ json: () => ({ id: 1 }) });
    await page.props().onSubmit();

    // One call to save the data, all other calls are skipped after large file size
    expect(dispatch.callCount).to.equal(1);
  });
});
