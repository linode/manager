import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { testLinode } from '~/../test/data';
import { RepairPage } from '~/linodes/layouts/RepairPage';

describe('linodes/layouts/RepairPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: {
        ...testLinode,
        id: 'linode_1235',
        _disks: {
          totalPages: 1,
          totalResults: 0,
          pagesFetched: [1],
          disks: { },
        },
      },
      linode_1236: {
        ...testLinode,
        id: 'linode_1236',
        _disks: {
          totalPages: 1,
          totalResults: 2,
          pagesFetched: [1],
          disks: {
            disk_2234: {
              ...testLinode._disks.disks.disk_1234,
              id: 'disk_2234',
            },
            disk_2235: {
              ...testLinode._disks.disks.disk_1234,
              id: 'disk_2235',
            },
          },
        },
      },
      linode_1237: {
        ...testLinode,
        id: 'linode_1237',
        state: 'powered_off',
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };

  it('fetches a linode when mounted with an unknown linode', async () => {
    mount(
      <RepairPage
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: 'linode_1234' }}
      />);
    await new Promise(a => setTimeout(a, 0));
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches a linode
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
      api: { linodes: { totalPages: -1, linodes: { } } },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234');
  });

  it('fetches linode disks', async () => {
    mount(
      <RepairPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
      />);
    let dispatched = dispatch.firstCall.args[0];
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
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234/disks?page=1');
  });

  it('does not fetch when mounted with a known linode', () => {
    mount(
      <RepairPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
      />);
    expect(dispatch.calledTwice).to.equal(false);
  });

  describe('reset root password', () => {
    it('renders the appropriate message for Linodes without eligible disks', () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1235' }}
        />);
      page.setState({ loading: false });
      expect(page.contains(
        <p>This Linode does not have any disks eligible for password reset.</p>))
        .to.equal(true);
    });

    it('renders a PasswordInput component', () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
        />);
      page.setState({ loading: false });
      expect(page.find('PasswordInput')).to.exist;
    });

    it('renders disk selection for appropriate Linodes', () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1236' }}
        />);
      page.setState({ loading: false, disk: 'disk_2234' });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      expect(select).to.exist;
      const d = linodes.linodes.linode_1236._disks.disks.disk_2234;
      expect(select.contains(<option value={d.id} key={d.id}>{d.label}</option>))
        .to.equal(true);
    });

    it('updates state when selecting disks', () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1236' }}
        />);
      page.setState({ loading: false, disk: 'disk_2234' });
      const reset = page.find('.root-pw');
      const select = reset.find('select');
      select.simulate('change', { target: { value: 'disk_2235' } });
      expect(page.state('disk')).to.equal('disk_2235');
    });

    it('updates state when password changes', () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
        />);
      page.setState({ loading: false, disk: 'disk_1234' });
      const reset = page.find('.root-pw');
      reset.find('PasswordInput').props().onChange('new password');
      expect(page.state('password')).to.equal('new password');
    });

    it('resets root password when button is pressed', async () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1237' }}
        />);
      page.setState({ loading: false, disk: 'disk_1234', password: 'new password' });
      const { resetRootPassword } = page.instance();
      await resetRootPassword();
      const dispatched = dispatch.firstCall.args[0];
      dispatch.reset();
      const fetchStub = sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
      await dispatched(dispatch, () => ({ authentication: { token: 'hi' } }));
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.firstCall.args[1]).to.equal(
        '/linodes/linode_1237/disks/disk_1234/rootpass');
    });

    it('power cycles running Linodes when resetting password', async () => {
      const page = shallow(
        <RepairPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
        />);
      page.setState({ loading: false, disk: 'disk_1234', password: 'new password' });
      const { resetRootPassword } = page.instance();
      await resetRootPassword();
      let dispatched = dispatch.firstCall.args[0];
      const fetchStub = sandbox.stub(fetch, 'fetch').returns({ json: () => {} });
      const state = {
        authentication: { token: 'hi' },
        linodes: {
          ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: { ...testLinode, state: 'powered_off' },
          },
        },
      };
      await dispatched(dispatch, () => state);
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.firstCall.args[1]).to.equal(
        '/linodes/linode_1234/shutdown');
      fetchStub.reset();
      dispatched = dispatch.thirdCall.args[0];
      await dispatched(dispatch, () => state);
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.firstCall.args[1]).to.equal(
        '/linodes/linode_1234/boot');
    });
  });
});
