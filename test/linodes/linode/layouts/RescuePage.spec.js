import React from 'react';
console.log('2 from rescue page');
import sinon from 'sinon';
console.log('4 from rescue page');
import { mount, shallow } from 'enzyme';
console.log('6 from rescue page');
import { expect } from 'chai';
console.log('8 from rescue page');

import * as fetch from '~/fetch';
console.log('11 from rescue page');
import { testLinode } from '@/data/linodes';
console.log('13 from rescue page');
import { SHOW_MODAL } from '~/actions/modal';
console.log('15 from rescue page');
import { RescuePage } from '~/linodes/linode/layouts/RescuePage';
console.log('17 from rescue page');
import { expectRequest } from '@/common';
console.log('19 from rescue page');

describe('linodes/linode/layouts/RescuePage', () => {
  const sandbox = sinon.sandbox.create();
console.log('23 from rescue page');

  const dispatch = sandbox.spy();
console.log('26 from rescue page');

  afterEach(() => {
    dispatch.reset();
console.log('30 from rescue page');
    sandbox.restore();
console.log('32 from rescue page');
  });
console.log('34 from rescue page');

  // TODO: Please, somebody, remove this
  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      1235: {
        ...testLinode,
        id: 1235,
        _disks: {
          totalPages: 1,
          totalResults: 0,
          pagesFetched: [1],
          disks: { },
        },
      },
      1236: {
        ...testLinode,
        id: 1236,
        _disks: {
          totalPages: 1,
          totalResults: 2,
          pagesFetched: [1],
          disks: {
            2234: {
              ...testLinode._disks.disks[1234],
              id: 2234,
            },
            2235: {
              ...testLinode._disks.disks[1234],
              id: 2235,
            },
          },
        },
      },
      1237: {
        ...testLinode,
        id: 1237,
        status: 'offline',
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };
console.log('80 from rescue page');

  it('fetches a linode when mounted with an unknown linode', async () => {
    const page = shallow(
      <RescuePage
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: '1234' }}
      />);
console.log('89 from rescue page');
    const get = sandbox.stub(page.instance(), 'getLinode');
console.log('91 from rescue page');
    get.onFirstCall().returns(testLinode);
console.log('93 from rescue page');
    await page.instance().componentDidMount();
console.log('95 from rescue page');
    const dispatched = dispatch.secondCall.args[0];
console.log('97 from rescue page');
    // Assert that dispatched is a function that fetches a linode
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
console.log('102 from rescue page');
    dispatch.reset();
console.log('104 from rescue page');
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
      api: { linodes: { totalPages: -1, linodes: { } } },
    }));
console.log('109 from rescue page');
    expect(fetchStub.calledOnce).to.equal(true);
console.log('111 from rescue page');
    expect(fetchStub.firstCall.args[1]).to.equal('/linode/instances/1234');
console.log('113 from rescue page');
  });
console.log('115 from rescue page');

  it('fetches linode disks', async () => {
    const page = shallow(
      <RescuePage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: '1234' }}
      />);
console.log('124 from rescue page');
    await page.instance().componentDidMount();
console.log('126 from rescue page');
    let dispatched = dispatch.thirdCall.args[0];
console.log('128 from rescue page');
>>>>>>> tests not passing yet
    // Assert that dispatched is a function that fetches disks
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
console.log('133 from rescue page');
    dispatch.reset();
console.log('135 from rescue page');
    const state = {
      authentication: { token: 'token' },
      api: {
        linodes: {
          ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              _disks: {
                ...testLinode._disks,
                totalPages: -1,
                pagesFetched: [],
              },
            },
          },
        },
      },
    };
console.log('155 from rescue page');
    await dispatched(dispatch, () => state);
console.log('157 from rescue page');
    dispatched = dispatch.firstCall.args[0];
console.log('159 from rescue page');
    dispatch.reset();
console.log('161 from rescue page');
    await dispatched(dispatch, () => state);
console.log('163 from rescue page');
    expect(fetchStub.calledOnce).to.equal(true);
console.log('165 from rescue page');
    expect(fetchStub.firstCall.args[1]).to.equal('/linode/instances/1234/disks/?page=1');
console.log('167 from rescue page');
  });
console.log('169 from rescue page');

  it('does not fetch when mounted with a known linode', async () => {
    const page = shallow(
      <RescuePage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: `${testLinode.id}` }}
      />);
console.log('178 from rescue page');
    await page.instance().componentDidMount();
console.log('180 from rescue page');
    expect(dispatch.callCount).to.equal(3);
console.log('182 from rescue page');
  });
console.log('184 from rescue page');

  describe('reset root password', () => {
    it('renders the appropriate message for Linodes without eligible disks', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1235' }}
        />);
console.log('194 from rescue page');
      page.setState({ loading: false });
console.log('196 from rescue page');
      expect(page.contains(
        'This Linode does not have any disks eligible for password reset.'))
        .to.equal(true);
console.log('200 from rescue page');
    });
console.log('202 from rescue page');

    it('renders a PasswordInput component', () => {
      const page = mount(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1234' }}
        />);
console.log('211 from rescue page');
      page.setState({ loading: false, disk: true });
console.log('213 from rescue page');
      expect(page.find('PasswordInput').length).to.equal(1);
console.log('215 from rescue page');
    });
console.log('217 from rescue page');

    it('renders disk selection for appropriate Linodes', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1236' }}
        />);
console.log('226 from rescue page');
      page.setState({ loading: false, disk: 2234 });
console.log('228 from rescue page');
      const reset = page.find('.root-pw');
console.log('230 from rescue page');
      const select = reset.find('select');
console.log('232 from rescue page');
      expect(select.length).to.equal(1);
console.log('234 from rescue page');
      const d = linodes.linodes[1236]._disks.disks[2234];
console.log('236 from rescue page');
      expect(select.contains(<option value={d.id} key={d.id}>{d.label}</option>))
        .to.equal(true);
console.log('239 from rescue page');
    });
console.log('241 from rescue page');

    it('updates state when selecting disks', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1236' }}
        />);
console.log('250 from rescue page');
      page.setState({ loading: false, disk: 2234 });
console.log('252 from rescue page');
      const reset = page.find('.root-pw');
console.log('254 from rescue page');
      const select = reset.find('select');
console.log('256 from rescue page');
      select.simulate('change', { target: { value: 2235 } });
console.log('258 from rescue page');
      expect(page.state('disk')).to.equal(2235);
console.log('260 from rescue page');
    });
console.log('262 from rescue page');

    it('updates state when password changes', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1234' }}
        />);
console.log('271 from rescue page');
      page.setState({ loading: false, disk: 1234 });
console.log('273 from rescue page');
      const reset = page.find('.root-pw');
console.log('275 from rescue page');
      reset.find('PasswordInput').props().onChange('new password');
console.log('277 from rescue page');
      expect(page.state('password')).to.equal('new password');
console.log('279 from rescue page');
    });
console.log('281 from rescue page');

    it('resets root password when button is pressed', async () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1237' }}
        />);
console.log('290 from rescue page');
      page.setState({ loading: false, disk: 1234, password: 'new password' });
console.log('292 from rescue page');
      const { resetRootPassword } = page.instance();
console.log('294 from rescue page');
      await resetRootPassword();
console.log('296 from rescue page');
      const fn = dispatch.firstCall.args[0];
console.log('298 from rescue page');

      const dispatched = () => ({ authentication: { token: 'hi' } });
console.log('301 from rescue page');
      await expectRequest(fn, '/linode/instances/1237/disks/1234/password', dispatched,
                         { }, { method: 'POST' });
console.log('304 from rescue page');
    });
console.log('306 from rescue page');

    it('shows a modal when reset root password button is pressed', async () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1237' }}
        />);
console.log('315 from rescue page');
      page.setState({ loading: false, disk: 1234, password: 'new password' });
console.log('317 from rescue page');
      page.find('button').simulate('click');
console.log('319 from rescue page');
      expect(dispatch.calledOnce).to.equal(true);
console.log('321 from rescue page');
      expect(dispatch.firstCall.args[0])
        .to.have.property('type').which.equals(SHOW_MODAL);
console.log('324 from rescue page');
    });
console.log('326 from rescue page');
  });
console.log('328 from rescue page');
});
console.log('330 from rescue page');

