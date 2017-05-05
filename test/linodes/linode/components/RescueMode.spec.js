import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { RescueMode } from '~/linodes/linode/components';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/layouts/RescueMode', () => {
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
    // iterate through the labels, there should be two disks and one for Finnix
    expect(page.find('.row-label').map(node => node.text())).to.deep.equal([
      '/dev/sda',
      '/dev/sdb',
      '/dev/sdh',
    ]);
  });

  it('dispatches reboot to rescue mode', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />);

    page.setState({ diskSlots: [12345, 12346] });
    page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rescue', { method: 'POST' }),
    ]);
  });
});
