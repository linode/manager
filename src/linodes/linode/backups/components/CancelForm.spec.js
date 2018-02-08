import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import CancelForm from '~/linodes/linode/backups/components/CancelForm';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/backups/components/CancelForm', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it.skip('shows cancel backups modal when button is pressed', async () => {
    const page = mount(
      <CancelForm
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('Form').props().onSubmit({ preventDefault() { } });

    const modal = mount(dispatch.firstCall.args[0].body);
    modal.find('Form').props().onSubmit({ preventDefault() { } });

    await expectDispatchOrStoreErrors(dispatch.secondCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/backups/cancel', { method: 'POST' }),
    ], 2);
  });
});
