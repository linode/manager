import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { ResetRootPassword } from '~/linodes/linode/components';

import { expectDispatchOrStoreErrors, expectRequest } from '@/common';
import { testLinode, testLinode1233, testLinode1235, testLinode1237 } from '@/data/linodes';


describe('linodes/linode/components/ResetRootPassword', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders the appropriate message for Linodes without eligible disks', () => {
    const page = shallow(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1235}
      />);
    page.setState({ loading: false });
    expect(page.contains(
      'This Linode does not have any disks eligible for password reset.'))
      .to.equal(true);
  });

  it('renders a PasswordInput component', () => {
    const page = mount(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode}
      />);
    page.setState({ loading: false, disk: true });
    expect(page.find('PasswordInput').length).to.equal(1);
  });

  it('renders disk selection for appropriate Linodes', () => {
    const page = mount(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1233}
      />);
    page.setState({ loading: false, disk: 12345 });
    const reset = page.find('.root-pw');
    const select = reset.find('select');
    expect(select.length).to.equal(1);
    const { label } = testLinode1233._disks.disks['12345'];
    expect(select.find('option').text()).to.equal(label);
  });

  it('updates state when selecting disks', () => {
    const page = mount(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1233}
      />);
    page.setState({ loading: false, disk: 2234 });
    const reset = page.find('.root-pw');
    const select = reset.find('select');
    select.simulate('change', { target: { value: 2235 } });
    expect(page.instance().state.disk).to.equal(2235);
  });

  it('updates state when password changes', () => {
    const page = shallow(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode}
      />);
    page.setState({ loading: false, disk: 1234 });
    const reset = page.find('.root-pw');
    reset.find('PasswordInput').props().onChange('new password');
    expect(page.state('password')).to.equal('new password');
  });

  it('resets root password when button is pressed', async () => {
    const page = shallow(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1237}
      />);
    page.setState({ loading: false, disk: 1234, password: 'new password' });

    page.find('Form').simulate('submit');

    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1237/disks/1234/password', {
        method: 'POST',
        body: { password: 'new password' },
      }),
    ], 1);
  });

  it('shows a modal for confirmation when reset root password form is submitted', () => {
    const page = mount(
      <ResetRootPassword
        dispatch={dispatch}
        linode={testLinode1237}
      />);
    page.setState({ loading: false, disk: 1234, password: 'new password' });
    page.find('.ResetRootPassword-form').simulate('submit');
    expect(dispatch.callCount).to.equal(2);
    expect(dispatch.secondCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
