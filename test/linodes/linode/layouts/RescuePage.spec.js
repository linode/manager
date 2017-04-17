import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { SHOW_MODAL } from '~/actions/modal';
import { RescuePage } from '~/linodes/linode/layouts/RescuePage';
import { expectRequest } from '@/common';
import { state } from '@/data';

const { linodes } = state.api;

describe('linodes/linode/layouts/RescuePage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('fetches linode disks', async () => {
    const _dispatch = sinon.stub();
    await RescuePage.preload({ dispatch: _dispatch, getState: () => state },
                             { linodeLabel: 'test-linode-1242' });

    expect(_dispatch.callCount).to.equal(1);
    let fn = _dispatch.firstCall.args[0];
    _dispatch.reset();
    _dispatch.returns({ total_pages: 1, disks: [], total_results: 0 });
    await fn(_dispatch, () => state);
    fn = _dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1242/disks/?page=1', undefined, {
      disks: [],
    });
  });

  describe('reset root password', () => {
    it('renders the appropriate message for Linodes without eligible disks', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-1' }}
        />);
      page.setState({ loading: false });
      expect(page.contains(
        'This Linode does not have any disks eligible for password reset.'))
        .to.equal(true);
    });

    it('renders a PasswordInput component', () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
        />);
      page.setState({ loading: false, disk: true });
      expect(page.find('PasswordInput').length).to.equal(1);
    });

    it('renders disk selection for appropriate Linodes', () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-1233' }}
        />);
      page.setState({ loading: false, disk: 12345 });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      expect(select.length).to.equal(1);
      const { label } = linodes.linodes['1233']._disks.disks['12345'];
      expect(select.find('option').text()).to.equal(label);
    });

    it('updates state when selecting disks', () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-1233' }}
        />);
      page.setState({ loading: false, disk: 2234 });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      select.simulate('change', { target: { value: 2235 } });
      expect(page.instance().state.disk).to.equal(2235);
    });

    it('updates state when password changes', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
        />);
      page.setState({ loading: false, disk: 1234 });
      const reset = page.find('.root-pw');
      reset.find('PasswordInput').props().onChange('new password');
      expect(page.state('password')).to.equal('new password');
    });

    it('resets root password when button is pressed', async () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-3' }}
        />);
      page.setState({ loading: false, disk: 1234, password: 'new password' });
      const { resetRootPassword } = page.instance();
      await resetRootPassword();
      const fn = dispatch.firstCall.args[0];

      await expectRequest(fn, '/linode/instances/1237/disks/1234/password', {
        method: 'POST',
        body: { password: 'new password' },
      });
    });

    it('shows a modal for confirmation when reset root password form is submitted', () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-3' }}
        />);
      page.setState({ loading: false, disk: 1234, password: 'new password' });
      page.find('.ResetRootPassword-form').simulate('submit');
      expect(dispatch.callCount).to.equal(2);
      expect(dispatch.secondCall.args[0])
        .to.have.property('type').which.equals(SHOW_MODAL);
    });

    it('shows disks in rescue mode', async () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
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
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
        />);
      page.setState({ diskSlots: [12345, 12346] });
      // simulate pressing the submit button, the action should get dispatched
      page.find('.RescueMode-form').simulate('submit');
      const fn = dispatch.secondCall.args[0];
      await expectRequest(fn, '/linode/instances/1234/rescue', { method: 'POST' });
    });
  });
});

