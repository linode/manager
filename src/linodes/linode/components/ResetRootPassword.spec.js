import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { ResetRootPassword } from '~/linodes/linode/components';

import { expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';
import { testLinode1237 } from '~/data/linodes';


describe('linodes/linode/components/ResetRootPassword', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1237}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('resets root password', async () => {
    const dispatch = sandbox.spy();
    const page = shallow(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1237}
      />
    );
    page.setState({ loading: false, disk: 1234, password: 'new password' });

    await page.instance().onSubmit();

    expect(dispatch.callCount).toBe(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1237/disks/1234/password', {
        method: 'POST',
        body: { password: 'new password' },
      }),
    ], 1);
  });

  it.skip('shows a modal for confirmation', async () => {
    const dispatch = sandbox.spy();
    const page = mount(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1237}
      />);
    page.setState({ loading: false, disk: 1234, password: 'new password' });

    await page.find('Form').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
