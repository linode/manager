import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import * as fetch from '~/fetch';
import { testLinode } from '@/data/linodes';
import { SHOW_MODAL } from '~/actions/modal';
import { RescuePage } from '~/linodes/linode/layouts/RescuePage';
import { expectRequest } from '@/common';

describe('linodes/linode/layouts/RescuePage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

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

  it('fetches linode disks', async () => {
    const page = shallow(
      <RescuePage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: '1234' }}
      />);
    await page.instance().componentDidMount();
    let dispatched = dispatch.thirdCall.args[0];
    // Assert that dispatched is a function that fetches disks
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
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
    await dispatched(dispatch, () => state);
    dispatched = dispatch.firstCall.args[0];
    dispatch.reset();
    await dispatched(dispatch, () => state);
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linode/instances/1234/disks/?page=1');
  });

  it('does not fetch when mounted with a known linode', async () => {
    const page = shallow(
      <RescuePage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: `${testLinode.id}` }}
      />);
    await page.instance().componentDidMount();
    expect(dispatch.callCount).to.equal(3);
  });

  describe('reset root password', () => {
    it('renders the appropriate message for Linodes without eligible disks', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1235' }}
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
          params={{ linodeId: '1234' }}
        />);
      page.setState({ loading: false, disk: true });
      expect(page.find('PasswordInput').length).to.equal(1);
    });

    it('renders disk selection for appropriate Linodes', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1236' }}
        />);
      page.setState({ loading: false, disk: 2234 });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      expect(select.length).to.equal(1);
      const d = linodes.linodes[1236]._disks.disks[2234];
      expect(select.contains(<option value={d.id} key={d.id}>{d.label}</option>))
        .to.equal(true);
    });

    it('updates state when selecting disks', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1236' }}
        />);
      page.setState({ loading: false, disk: 2234 });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      select.simulate('change', { target: { value: 2235 } });
      expect(page.state('disk')).to.equal(2235);
    });

    it('updates state when password changes', () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1234' }}
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
          params={{ linodeId: '1237' }}
        />);
      page.setState({ loading: false, disk: 1234, password: 'new password' });
      const { resetRootPassword } = page.instance();
      await resetRootPassword();
      const fn = dispatch.firstCall.args[0];

      const dispatched = () => ({ authentication: { token: 'hi' } });
      await expectRequest(fn, '/linode/instances/1237/disks/1234/password', dispatched,
                         { }, { method: 'POST' });
    });

    it('shows a modal when reset root password button is pressed', async () => {
      const page = shallow(
        <RescuePage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: '1237' }}
        />);
      page.setState({ loading: false, disk: 1234, password: 'new password' });
      page.find('button').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.firstCall.args[0])
        .to.have.property('type').which.equals(SHOW_MODAL);
    });
  });
});

