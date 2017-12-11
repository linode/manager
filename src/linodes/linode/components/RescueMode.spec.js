import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { RescueMode } from '~/linodes/linode/components';

import {
  changeInput, expectDispatchOrStoreErrors, expectObjectDeepEquals, expectRequest,
} from '~/test.helpers';
import { testLinode } from '~/data/linodes';


describe('linodes/linode/components/RescueMode', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('shows disks in rescue mode', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />
    );
    page.setState({ diskSlots: [12345, 12346] });
    expectObjectDeepEquals(page.find('.row-label').map(node => node.text()), [
      '/dev/sdh',
    ]);
  });

  it.skip('dispatches reboot to rescue mode', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />);

    changeInput(page, 'sda', JSON.stringify({ disk_id: 12345 }));
    changeInput(page, 'sdb', JSON.stringify({ disk_id: 12346 }));
    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rescue', {
        method: 'POST',
        body: {
          devices: {
            sda: { disk_id: 12345 },
            sdb: { disk_id: 12346 },
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

  it.skip('rescue disks are auto-populated in filesystem order', async () => {
    const page = mount(
      <RescueMode
        dispatch={dispatch}
        linode={testLinode}
      />);

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1234/rescue', {
        method: 'POST',
        body: {
          devices: {
            sda: { disk_id: 12345 },
            sdb: { disk_id: 12346 },
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
