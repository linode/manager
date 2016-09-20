import React, { Component } from 'react';
import sinon from 'sinon';
import { push } from 'react-router-redux';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { api, freshState } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import * as LinodeDetailPageWrapper from '~/linodes/layouts/LinodeDetailPage';
import * as linodeActions from '~/actions/api/linodes';
import { Tabs, Tab } from 'react-tabs';
import Dropdown from '~/components/Dropdown';
import { hideModal } from '~/actions/modal';
import { SET_ERROR } from '~/actions/errors';

const {
  LinodeDetailPage,
  EditModal,
  getLinode,
  renderTabs,
} = LinodeDetailPageWrapper;

const { linodes } = api;

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
        linodes={freshState.api.linodes}
        params={{ linodeId: -1 }}
      />
    );
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    expectRequest(fn, `/linode/instances/${testLinode.id}`,
      d => expect(d.args[0].type).to.equal(linodeActions.UPDATE_LINODE));
  });

  it('handles errors from fetchLinode', () => {
    sandbox.stub(linodeActions, 'fetchLinode').throws({
      json: () => ({ foo: 'bar' }),
      headers: { get() { return 'application/json'; } },
      statusCode: 400,
      statusText: 'Bad Request',
    });
    mount(
      <Test
        dispatch={dispatch}
        linodes={freshState.api.linodes}
        params={{ linodeId: testLinode.id }}
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
        params={{ linodeId: testLinode.id }}
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
        params={{ linodeId: testLinode.id }}
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
        params={{ linodeId: 1235 }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span>{linodes.linodes[1235].label}</span>))
      .to.equal(true);
  });

  it('renders tabs with correct names and links', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1235 }}
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
    ].map(t => ({ ...t, link: `/linodes/1235${t.link}` }));

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
        params={{ linodeId: testLinode.id }}
        detail={detail}
      />);
    const dropdown = page.find(Dropdown);
    expect(dropdown).to.exist;
  });

  it('renders a config profile selection dropdown', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1238 }}
        detail={detail}
      />);
    const select = page.find('.tabs').find('.configs');
    expect(select.contains(
      <option key={12345} value={12345}>Test config</option>))
      .to.equal(true);
    expect(select.contains(
      <option key={12346} value={12346}>Test config 2</option>))
      .to.equal(true);
  });

  it('switches the selected config when clicked', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: 1238 }}
        detail={detail}
      />);
    const select = page.find('.tabs').find('.configs select');
    select.simulate('change', { target: { value: 12346 } });
    expect(page.state('config')).to.equal(12346);
  });

  it('renders the appropriate items when linode is running', () => {
    const page = shallow(
      <LinodeDetailPage
        dispatch={dispatch}
        linodes={linodes}
        params={{ linodeId: testLinode.id }}
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
        params={{ linodeId: 1236 }}
        detail={detail}
      />);
    const dropdown = page.find(Dropdown).props();
    const expected = ['Power On'];
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
        params={{ linodeId: 1237 }}
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
        params={{ linodeId: testLinode.id }}
        detail={detail}
        router={router}
      />);
    expect(page.contains(<span className="pull-right linode-status running">Running</span>))
      .to.equal(true);
  });
});

describe('linodes/layouts/LinodeDetailPage EditModal', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('should render group and label inputs', () => {
    const modal = mount(
      <EditModal
        dispatch={() => {}}
        label="test label"
        group="test group"
        linodeId={1234}
      />);
    expect(modal.find('input#group')).to.exist;
    expect(modal.find('input#group').props().value).to.equal('test group');
    expect(modal.find('input#label')).to.exist;
    expect(modal.find('input#label').props().value).to.equal('test label');
  });

  it('hide modal when "Nevermind" is clicked', () => {
    const dispatch = sandbox.spy();
    const modal = shallow(
      <EditModal
        dispatch={dispatch}
        label="test label"
        group="test group"
        linodeId={1234}
      />);
    modal.find('.btn-default').simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0]).to.deep.equal(hideModal());
  });

  it('save changes when "Save" is clicked', () => {
    const dispatch = sandbox.spy();
    const modal = shallow(
      <EditModal
        dispatch={dispatch}
        label="test label"
        group="test group"
        linodeId={1234}
      />);
    const saveStub = sandbox.stub(modal.instance(), 'saveChanges');
    modal.find('input#group').simulate('change', {
      target: { value: 'new group' },
    });
    modal.find('input#label').simulate('change', {
      target: { value: 'new label' },
    });
    modal.find('.btn-primary').simulate('click');
    expect(saveStub.calledOnce).to.equal(true);
    saveStub.restore();
  });

  describe('saveChanges', () => {
    it('performs the HTTP request', async () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <EditModal
          dispatch={dispatch}
          label="test label"
          group="test group"
          linodeId={1234}
        />);
      modal.find('input#group').simulate('change', {
        target: { value: 'new group' },
      });
      modal.find('input#label').simulate('change', {
        target: { value: 'new label' },
      });
      const { saveChanges } = modal.instance();
      await saveChanges();
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, '/linode/instances/1234',
        () => {}, null, o => {
          expect(o.method).to.equal('PUT');
          expect(o.body).to.equal(JSON.stringify({
            label: 'new label',
            group: 'new group',
          }));
        });
    });

    it('handles exceptions', async () => {
      const dispatch = sandbox.stub();
      const modal = mount(
        <EditModal
          dispatch={dispatch}
          label="test label"
          group="test group"
          linodeId={1234}
        />);
      modal.find('input#group').simulate('change', {
        target: { value: 'new group' },
      });
      modal.find('input#label').simulate('change', {
        target: { value: 'new label' },
      });
      const { saveChanges } = modal.instance();
      dispatch.reset();
      dispatch.throws({
        json() {
          return {
            errors: [
              { field: 'label', reason: 'some label error' },
              { field: 'group', reason: 'some group error' },
            ],
          };
        },
      });
      await saveChanges();
      expect(modal.find('.form-group').at(0).hasClass('has-danger'))
        .to.equal(true);
      expect(modal.find('.form-group').at(1).hasClass('has-danger'))
        .to.equal(true);
      expect(modal.contains(
        <div
          key={'some label error'}
        >some label error</div>)).to.equal(true);
      expect(modal.contains(
        <div
          key={'some group error'}
        >some group error</div>)).to.equal(true);
    });
  });
});
