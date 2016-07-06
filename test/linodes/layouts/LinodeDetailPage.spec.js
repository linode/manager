import React, { Component } from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { testLinode, linodes } from '~/../test/data';
import * as LinodeDetailPageWrapper from '~/linodes/layouts/LinodeDetailPage';
import * as linodeActions from '~/actions/api/linodes';
import { Tabs, Tab } from 'react-tabs';
import * as actions from '~/linodes/actions/detail/index';
import Dropdown from '~/components/Dropdown';
import { SET_ERROR } from '~/actions/errors';

const {
  LinodeDetailPage,
  getLinode,
  renderTabs,
} = LinodeDetailPageWrapper;

describe('linodes/layouts/LinodeDetailPage/loadLinode', async () => {
  class Test extends Component {
    constructor() {
      super();
      this.getLinode = getLinode.bind(this);
      this.componentDidMount = LinodeDetailPageWrapper.loadLinode.bind(this);
    }

    render() {
      return <span></span>;
    }
  }

  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();
  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('fetches a linode when mounted with an unknown linode', async () => {
    mount(
      <Test
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: 'linode_1234' }}
      />
    );
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
    expect(dispatch.firstCall.args[0].type).to.equal(linodeActions.UPDATE_LINODE);
  });

  it('handles errors from updateLinode', () => {
    sandbox.stub(linodeActions, 'updateLinode').throws({
      json: () => ({ foo: 'bar' }),
      headers: { get() { return 'application/json'; } },
      statusCode: 400,
      statusText: 'Bad Request',
    });
    mount(
      <Test
        dispatch={dispatch}
        linodes={{ linodes: { } }}
        params={{ linodeId: 'linode_1234' }}
      />);
    expect(dispatch.calledWith({
      type: SET_ERROR,
      json: { foo: 'bar' },
      status: 400,
      statusText: 'Bad Request',
    }));
  });

  it('does not fetch when mounted with a known linode', async () => {
    mount(
      <Test
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
      />);
    expect(dispatch.calledOnce).to.equal(false);
  });
});

describe('linodes/layouts/LinodeDetailPage/renderTabs', async () => {
  class Test extends Component {
    constructor() {
      super();
      this.renderTabs = renderTabs.bind(this);
    }

    render() {
      // eslint-disable-next-line react/prop-types
      return this.renderTabs(this.props.tabList);
    }
  }

  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();
  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const tabList = [
    { name: 'One', link: '/one' },
    { name: 'Two', link: '/two' },
  ];

  it('renders tabs', () => {
    const page = shallow(
      <Test
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
        tabList={tabList}
      />);
    const tabs = page.find(Tabs);
    expect(tabs).to.exist;
    tabList.forEach(({ name, link }) => {
      expect(tabs.find(Tab).filter(t => t.text() === name)).to.exist;
      expect(tabs.find(Tab).filter(t => t.To === link)).to.exist;
    });
  });

  it('dispatches a push action when tabs are clicked', () => {
    const page = shallow(
      <Test
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
        tabList={tabList}
      />
    );
    const tabs = page.find(Tabs);
    tabs.props().onSelect(1);
    expect(dispatch.calledWith(push('/two'))).to.equal(true);
  });
});

describe('linodes/layouts/LinodeDetailPage', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  const router = { setRouteLeaveHook: sandbox.spy() };

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const detail = {
    editing: false,
    label: '',
    group: '',
    loading: false,
    errors: {
      label: null,
      group: null,
      _: null,
    },
  };

  it('calls loadLinode during mount', () => {
    const loadLinode = sinon.stub(LinodeDetailPageWrapper, 'loadLinode');
    mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        detail={detail}
        router={router}
      />
    );

    expect(loadLinode.calledOnce).to.equal(true);
    loadLinode.restore();
  });

  it('renders the linode label and group', () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span>{testLinode.group} / {testLinode.label}</span>))
      .to.equal(true);
  });

  it('renders the linode label alone when ungrouped', () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span>{testLinode.label}</span>))
      .to.equal(true);
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1235' }}
        detail={detail}
      />
    );

    const tabList = [
      { name: 'General', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Resize', link: '/resize' },
      { name: 'Repair', link: '/repair' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/linode_1235${t.link}` }));

    const tabs = page.find(Tabs);
    tabList.forEach(({ name, link }) => {
      expect(tabs.find(Tab).filter(t => t.text() === name)).to.exist;
      expect(tabs.find(Tab).filter(t => t.To === link)).to.exist;
    });
  });

  it('renders a power management dropdown', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
        detail={detail}
      />);
    const dropdown = page.find(Dropdown);
    expect(dropdown).to.exist;
  });

  it('renders the appropriate items when linode is running', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
        detail={detail}
      />);
    const dropdown = page.find(Dropdown).props();
    const expected = ['Reboot', 'Power Off'];
    for (let i = 0; i < expected.length; ++i) {
      const elem = shallow(dropdown.elements[i].name);
      expect(elem.text()).to.contain(expected[i]);
    }
  });

  it('renders the appropriate items when linode is powered off', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1236' }}
        detail={detail}
      />);
    const dropdown = page.find(Dropdown).props();
    const expected = ['Reboot', 'Power On'];
    for (let i = 0; i < expected.length; ++i) {
      const elem = shallow(dropdown.elements[i].name);
      expect(elem.text()).to.contain(expected[i]);
    }
  });

  it('does not render power management dropdown when linode is transitioning', () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1237' }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(Dropdown)).to.equal(false);
  });

  it('renders the current state of the linode', () => {
    const page = mount(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 'linode_1234' }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span className="pull-right linode-status running">Running</span>))
      .to.equal(true);
  });

  describe('edit mode', () => {
    it('renders an edit button', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={detail}
        />);
      expect(page.find('.edit-icon')).to.exist;
    });

    it('toggles edit mode when edit is pressed', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={detail}
        />);
      const icon = page.find('.edit-icon');
      icon.simulate('click', { preventDefault: () => {} });
      expect(dispatch.calledWith(actions.toggleEditMode())).to.equal(true);
    });

    it('copies the current group/label to the state', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={detail}
        />);
      const icon = page.find('.edit-icon');
      icon.simulate('click', { preventDefault: () => {} });
      expect(dispatch.calledWith(actions.setLinodeLabel(testLinode.label)))
        .to.equal(true);
      expect(dispatch.calledWith(actions.setLinodeGroup(testLinode.group)))
        .to.equal(true);
    });

    it('renders group/label text boxes in edit mode', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true }}
        />);
      const editor = page.find('.edit-details');
      expect(editor).to.exist;
      expect(editor.find('input[type="text"]').length)
        .to.equal(2);
      expect(editor.find('input[type="text"]').get(0).props.placeholder)
        .to.equal('Group...');
      expect(editor.find('input[type="text"]').get(1).props.placeholder)
        .to.equal('Label...');
    });

    it('renders save and cancel buttons', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true }}
        />);
      const editor = page.find('.edit-details');
      expect(editor).to.exist;
      expect(editor.find('button').length).to.equal(2);
      expect(editor.find('button.btn-primary').text()).to.equal('Save');
      expect(editor.find('button.btn-secondary').text()).to.equal('Cancel');
    });

    it('disables save and cancel buttons when loading', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true, loading: true }}
        />);
      const editor = page.find('.edit-details');
      expect(editor).to.exist;
      expect(editor.find('button').length).to.equal(2);
      expect(editor.find('button.btn-primary').props())
        .to.have.property('disabled').which.equals(true);
      expect(editor.find('button.btn-secondary').props())
        .to.have.property('disabled').which.equals(true);
    });

    it('leaves edit mode when cancel is pressed', () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true }}
        />);
      const editor = page.find('.edit-details');
      const cancel = editor.find('button.btn-secondary');
      cancel.simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(actions.toggleEditMode())).to.equal(true);
    });

    async function assertCommittedChanges() {
      expect(dispatch.calledOnce).to.equal(true);
      const dispatched = dispatch.firstCall.args[0];
      // Assert that dispatched is a function that commits the changes
      const fetchStub = sandbox.stub(fetch, 'fetch').returns({
        json: () => {},
      });
      dispatch.reset();
      const getState = () => ({
        authentication: { token: 'token' },
        linodes: { detail: { index: { label: 'test', group: 'test' } } },
      });
      await dispatched(dispatch, getState);
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.firstCall.args[1]).to.equal('/linodes/linode_1234');
    }

    it('commits changes to the API when save is pressed', async () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true, label: 'test', group: 'test' }}
        />);
      const editor = page.find('.edit-details');
      const cancel = editor.find('button.btn-primary');
      cancel.simulate('click');
      await assertCommittedChanges();
    });

    it('commits changes to the API when the enter key is pressed', async () => {
      const page = shallow(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true, label: 'test', group: 'test' }}
        />);
      const editor = page.find('.edit-details');
      const text = editor.find('input[type="text"]').first();
      text.simulate('keyUp', { keyCode: 13 /* Enter */ });
      await assertCommittedChanges();
    });

    it('does not reproduce #95', () => {
      router.setRouteLeaveHook.reset();
      mount(
        <LinodeDetailPage
          dispatch={dispatch}
          linodes={linodes}
          params={{ linodeId: 'linode_1234' }}
          detail={{ ...detail, editing: true, label: 'test', group: 'test' }}
          router={router}
        />);
      expect(router.setRouteLeaveHook.calledOnce).to.equal(true);
      const handler = router.setRouteLeaveHook.firstCall.args[1];
      handler();
      expect(dispatch.calledWith(actions.toggleEditMode())).to.equal(true);
    });
  });
});
