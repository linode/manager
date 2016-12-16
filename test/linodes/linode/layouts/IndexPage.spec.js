import React, { Component } from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { api, state } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import * as IndexPageWrapper from '~/linodes/linode/layouts/IndexPage';
import Dropdown from '~/components/Dropdown';

const {
  IndexPage,
  renderTabs,
} = IndexPageWrapper;

const { linodes } = api;

describe('linodes/linode/layouts/IndexPage/renderTabs', async () => {
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
        params={{ linodeId: testLinode.id }}
        tabList={tabList}
      />);

    const tabs = page.find('Tabs').find('Tab');
    expect(tabs.length).to.equal(tabList.length);
    tabList.forEach(({ name, link }, i) => {
      expect(tabs.at(i).children().text()).to.equal(name);
    });
  });

  it('dispatches a push action when tabs are clicked', () => {
    const page = shallow(
      <Test
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
        tabList={tabList}
      />
    );
    const tabs = page.find('Tabs').find('Tab');
    tabs.at(1).simulate('click');
    expect(dispatch.calledWith(push('/two'))).to.equal(true);
  });
});

describe('linodes/linode/layouts/IndexPage', () => {
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

  it('preloads the linode', async () => {
    await IndexPage.preload({ dispatch }, { linodeId: '-1' });

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/-1');
  });

  it('preloads the configs', async () => {
    const _dispatch = sinon.stub();
    await IndexPage.preload({ dispatch: _dispatch }, { linodeId: '1241' });

    let fn = _dispatch.secondCall.args[0];
    _dispatch.reset();
    _dispatch.returns({ total_pages: 1, configs: [], total_results: 0 });
    await fn(_dispatch, () => state);
    fn = _dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1241/configs/?page=1', undefined, {
      configs: [],
    });
  });

  it('renders the linode label and group', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: `${testLinode.id}` }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span>{testLinode.group} / {testLinode.label}</span>))
      .to.equal(true);
  });

  it('renders the linode label alone when ungrouped', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: '1235' }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span>{linodes.linodes[1235].label}</span>))
      .to.equal(true);
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: '1235' }}
        detail={detail}
      />
    );

    const tabList = [
      { name: 'Dashboard', link: '' },
      { name: 'Networking', link: '/networking' },
      { name: 'Rebuild', link: '/rebuild' },
      { name: 'Resize', link: '/resize' },
      { name: 'Rescue', link: '/rescue' },
      { name: 'Backups', link: '/backups' },
      { name: 'Settings', link: '/settings' },
    ].map(t => ({ ...t, link: `/linodes/1235${t.link}` }));

    const tabs = page.find('Tabs').find('Tab');
    expect(tabs.length).to.equal(tabList.length);
    tabList.forEach(({ name, link }, i) => {
      expect(tabs.at(i).children().text()).to.equal(name);
    });
  });

  it('renders a power management dropdown', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: `${testLinode.id}` }}
        detail={detail}
      />);
    const dropdown = page.find('StatusDropdown');
    expect(dropdown.length).to.equal(1);
  });

  it('does not render power management dropdown when linode is transitioning', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: '1237' }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(Dropdown)).to.equal(false);
  });
});
