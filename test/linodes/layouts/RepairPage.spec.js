import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
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
    it('renders the appropriate message for Linodes without eligible disks');

    it('renders a PasswordInput component');

    it('renders disk selection for appropriate Linodes');

    it('updates state when selecting disks');

    it('updates state when password changes');

    it('resets root password when button is pressed');

    it('power cycles running Linodes when resetting password');

    it('handles errors during password reset');
  });
});
