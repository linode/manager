import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { CreateOrEditApplication } from '~/profile/components';

import {
  changeInput,
  expectDispatchOrStoreErrors,
  expectRequest,
} from '~/test.helpers';


describe('profile/components/CreateOrEditApplication', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.stub();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <CreateOrEditApplication
        title="CreateOrEditApplication"
        dispatch={dispatch}
        close={dispatch}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('creates a new application', async () => {
    const page = shallow(
      <CreateOrEditApplication
        title="CreateOrEditApplication"
        dispatch={dispatch}
        close={dispatch}
      />
    );

    changeInput(page, 'label', 'My new client');
    changeInput(page, 'redirect', 'http://example.com');
    changeInput(page, 'public_', true);
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB - 0.5) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    await page.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/oauth-clients/', {
        method: 'POST',
        body: {
          label: 'My new client',
          redirect_uri: 'http://example.com',
          public: true,
        },
      }),
      async ([fn]) => expectRequest(fn, '/account/oauth-clients/1/thumbnail', {
        method: 'PUT',
        body: thumbnail,
        headers: { 'Content-Type': 'image/png' },
      }),
    ], 3, [{ id: 1, secret: '', public: true }]);
    // One call to save the data, one call to save the thumbnail, one call to show the secret.
  });

  it('fails on a larger file', async () => {
    const page = shallow(
      <CreateOrEditApplication
        title="CreateOrEditApplication"
        dispatch={dispatch}
        close={dispatch}
      />
    );

    changeInput(page, 'label', 'My new client');
    changeInput(page, 'redirect', 'http://example.com');
    changeInput(page, 'public_', true);
    const thumbnail = { size: (MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024 };
    page.instance().setState({ thumbnail });

    dispatch.reset();
    await page.props().onSubmit();

    // One call to save the data, all other calls are skipped after large file size
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [], 1, [{ id: 1 }]);
  });

  it('updates an application', async () => {
    const close = sandbox.spy();
    const page = shallow(
      <CreateOrEditApplication
        title="CreateOrEditApplication"
        dispatch={dispatch}
        close={close}
        label="My awesome client"
        redirect_uri="http://example.com"
        id="1"
      />
    );

    changeInput(page, 'label', 'My new client');
    changeInput(page, 'redirect', 'http://google.com');
    changeInput(page, 'public_', false);

    dispatch.reset();
    await page.props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/account/oauth-clients/1', {
        method: 'PUT',
        body: {
          label: 'My new client',
          redirect_uri: 'http://google.com',
          public: false,
        },
      }),
    ], 1, [{ id: 1 }]);

    expect(close.callCount).toBe(1);
  });

  it('has the public field disabled upon edit', async () => {
    const page = shallow(
      <CreateOrEditApplication
        title="CreateOrEditApplication"
        dispatch={dispatch}
        close={close}
        label="My awesome client"
        redirect_uri="http://example.com"
        id="1"
        public={false}
        forEdit
      />
    );

    expect(page.find('#public_').at(0).props().disabled).toBe(true);
  });
});
