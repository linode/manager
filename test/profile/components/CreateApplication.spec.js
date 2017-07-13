import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import * as fetch from '~/fetch';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { CreateOrEditApplication } from '~/profile/components';

import { expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest } from '@/common';
import { state } from '@/data';


describe('profile/components/CreateOrEditApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('creates a new application', async () => {
    const page = shallow(
      <CreateOrEditApplication
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

    await page.props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/clients/', {
        method: 'POST',
        body: {
          label: 'My new client',
          redirect_uri: 'http://example.com',
        },
      }),
      async ([fn]) => {
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
      },
    ], 3, [{ id: 1, secret: '' }]);
    // One call to save the data, one call to save the thumbnail, one call to show the secret.
  });

  it('fails on a larger file', async () => {
    const page = shallow(
      <CreateOrEditApplication
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
    await page.props().onSubmit();

    // One call to save the data, all other calls are skipped after large file size
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [], 1, [{ id: 1 }]);
  });
});
