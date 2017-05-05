import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { ResizePage } from '~/linodes/linode/layouts/ResizePage';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';
import { api } from '@/data';


describe('linodes/linode/layouts/ResizePage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('resize the linode', async () => {
    const page = mount(
      <ResizePage
        dispatch={dispatch}
        types={api.types}
        linode={testLinode}
      />
    );

    dispatch.reset();

    page.find('.plan').first().simulate('click');
    await page.find('form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/resize', {
        method: 'POST',
        body: {
          type: 'linode1024.5',
        },
      }),
    ]);
  });
});
