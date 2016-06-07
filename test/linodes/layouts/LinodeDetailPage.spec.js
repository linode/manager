import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { testLinode } from '~/../test/data';
import { LinodeDetailPage } from '~/linodes/layouts/LinodeDetailPage';
import { UPDATE_LINODE } from '~/actions/api/linodes';

describe('linodes/layouts/LinodeDetailPage', () => {
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
      linode_1235: { ...testLinode, id: 'linode_1235', group: '' },
      linode_1236: { ...testLinode, id: 'linode_1236', state: 'offline' },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };

  const detail = {
    tab: 0,
    editing: false,
    label: '',
    group: '',
    loading: false,
  };

  it('fetches a linode when mounted with an unknown linode', async () => {
    mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: 'linode_1234' }}
        detail={detail}
      />);
    expect(dispatch.calledOnce).to.equal(true);
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches a linode
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_LINODE);
  });

  it('does not fetch when mounted with a known linode', async () => {
    mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        detail={detail}
      />);
    expect(dispatch.calledOnce).to.equal(false);
  });

  it('renders the linode label and group', async () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        detail={detail}
      />);
    expect(page.contains(<span>{testLinode.group} / {testLinode.label}</span>))
      .to.equal(true);
  });

  it('renders the linode label alone when ungrouped', async () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        detail={detail}
      />);
    expect(page.contains(<span>{testLinode.label}</span>))
      .to.equal(true);
  });

  it('renders detail tabs');

  it('dispatches a tab change action when tabs are clicked');

  it('renders a power management dropdown');

  it('renders the appropriate items when linode is running');

  it('renders the appropriate items when linode is powered off');

  it('does not render power management dropdown when linode is transitioning');

  it('renders the current state of the linode');

  describe('edit mode', () => {
    it('renders an edit button');

    it('toggles edit mode when edit is pressed');

    it('renders group/label text boxes in edit mode');

    it('renders save and cancel buttons');

    it('disables save and cancel buttons when loading');

    it('leaves edit mode when cancel is pressed');

    it('commits changes to the API when save is pressed');

    it('commits changes to the API when the enter key is pressed');
  });
});
