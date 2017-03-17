import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import * as fetch from '~/fetch';
import { state } from '@/data';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import CreateApplication from '~/profile/integrations/components/CreateApplication';
import { expectRequest, expectObjectDeepEquals } from '@/common';

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
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://example.com');
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    dispatch.returns({ id: 1, secret: 'secret' });
    await page.props().onSubmit();

    // One call to save the data, one call to save the thumbnail, one call to show the secret.
    expect(dispatch.callCount).to.equal(3);

    let fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/clients/', {
      method: 'POST',
      body: {
        label: 'My new client',
        redirect_uri: 'http://example.com',
      },
    });

    // This is not a normal request, so we are not able to test it using expectRequest.
    fn = dispatch.secondCall.args[0];
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
    dispatch.reset();
    await fn(dispatch, () => state);

    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[1]).to.equal('/account/clients/1/thumbnail');
    expectObjectDeepEquals(fetchStub.firstCall.args[2], {
      method: 'PUT',
      body: thumbnail,
      headers: { 'Content-Type': 'image/png' },
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
      page.find('Input').find({ id }).simulate('change', { target: { value, name: id } });

    changeInput('label', 'My new client');
    changeInput('redirect', 'http://example.com');
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    dispatch.reset();
    dispatch.returns({ json: () => ({ id: 1 }) });
    await page.props().onSubmit();

    // One call to save the data, all other calls are skipped after large file size
    expect(dispatch.callCount).to.equal(1);
  });
});
