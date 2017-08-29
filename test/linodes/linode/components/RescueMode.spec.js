import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { RescueMode } from '~/linodes/linode/components';

import {
  changeInput, expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest,
} from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/components/RescueMode', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('shows disks in rescue mode', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />);
    page.setState({ diskSlots: [12345, 12346] });
    expectObjectDeepEquals(page.find('.row-label').map(node => node.text()), [
      '/dev/sdh',
    ]);
  });

  it('dispatches reboot to rescue mode', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />);

    changeInput(page, 'sda', 12345);
    changeInput(page, 'sdb', 12346);
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rescue', {
        method: 'POST',
        body: {
          disks: {
            sda: 12345,
            sdb: 12346,
            sdc: null,
            sdd: null,
            sde: null,
            sdf: null,
            sdg: null,
          },
        },
      }),
    ], 1);
  });
});
