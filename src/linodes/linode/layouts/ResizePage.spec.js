import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ResizePage } from '~/linodes/linode/layouts/ResizePage';

import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode } from '~/data/linodes';
import { api } from '~/data';


describe('linodes/linode/layouts/ResizePage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it.skip('resize the linode', async () => {
    const page = mount(
      <ResizePage
        dispatch={dispatch}
        types={api.types}
        linode={testLinode}
      />
    );

    dispatch.reset();

    changeInput(page, 'type', 'g5-nanode-1');

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/resize', {
        method: 'POST',
        body: {
          type: 'g5-nanode-1',
        },
      }),
    ]);
  });
});
