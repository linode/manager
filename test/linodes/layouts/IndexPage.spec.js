import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';
import _ from 'lodash';

import { IndexPage } from '~/linodes/layouts/IndexPage';
import * as linodeActions from '~/actions/api/linodes';
import { TOGGLE_SELECTED, CHANGE_VIEW } from '~/linodes/actions/index';
import { linodes } from '~/../test/data';
import Dropdown from '~/components/Dropdown';
import { SET_ERROR } from '~/actions/errors';
import { expectRequest } from '@/common.js';

describe('linodes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();
  const getState = () => ({
    authentication: { token: 'token' },
    api: {
      linodes: { totalPages: -1, pagesFetched: [] },
    },
  });

  it('dispatches a linodes fetch action when mounted', async () => {
    const testLinodes = {
      linodes: _.map(linodes.linodes, l => ({ ...l, state: 'running' })),
    };

    mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={testLinodes}
      />);
    expect(dispatch.calledOnce).to.equal(true);
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linodes?page=1', getState(),
      d => expect(d.args[0])
        .to.have.property('type')
        .that.equals(linodeActions.UPDATE_LINODES));
  });

  it('handles errors from fetchLinodes', () => {
    sandbox.stub(linodeActions, 'fetchLinodes').throws({
      json: () => ({ foo: 'bar' }),
      headers: { get() { return 'application/json'; } },
      statusCode: 400,
      statusText: 'Bad Request',
    });
    mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />);
    expect(dispatch.calledWith({
      type: SET_ERROR,
      json: { foo: 'bar' },
      status: 400,
      statusText: 'Bad Request',
    }));
  });

  it('redirects to /linodes/create when you have no Linodes', async () => {
    const noLinodes = {
      ...linodes,
      linodes: { },
    };
    mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={noLinodes}
      />);
    expect(dispatch.calledWith(push('/linodes/create')))
      .to.equal(true);
  });

  it('renders a grid of Linodes', () => {
    const testLinodes = {
      linodes: _.mapValues(linodes.linodes, l => ({ ...l, group: '' })),
    };
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={testLinodes}
      />
    );

    const gridRow = page.find('.linodes-page > .row');
    expect(gridRow.length).to.equal(1);
    expect(gridRow.find('.col-md-4').length).to.equal(
      Object.keys(linodes.linodes).length);
    expect(gridRow.find('.col-md-4').first().find('.linode-label')
                  .text()).to.equal('Test Linode');
    expect(gridRow.find('.col-md-4').last().find('.linode-label')
                  .text()).to.equal('Test Linode 1');
  });

  it('renders a list of Linodes', () => {
    const testLinodes = {
      linodes: _.mapValues(linodes.linodes, l => ({ ...l, group: '' })),
    };
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'list'}
        selected={{}}
        linodes={testLinodes}
      />
    );

    const table = page.find('table.linodes');
    expect(table).to.exist;
    expect(table.find('tbody tr').length).to.equal(
      Object.keys(linodes.linodes).length);
  });

  it('renders a power management dropdown', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />);
    const dropdown = page.find(Dropdown);
    expect(dropdown.length).to.equal(1);
    const elements = dropdown.props().elements;
    expect(elements).to.be.a('array');
    expect(elements.find(e => e.name === 'Power Off')).to.exist;
    expect(elements.find(e => e.name === 'Power On')).to.exist;
    expect(elements.find(e => e.name === 'Reboot')).to.exist;
    expect(elements.find(e => e.name === 'Delete')).to.exist;
  });

  function makePowerTest(dropdown, endpoint) {
    return async () => {
      const page = mount(
        <IndexPage
          dispatch={dispatch}
          view={'grid'}
          selected={{ linode_1234: true }}
          linodes={linodes}
        />);
      dispatch.reset();
      const actions = page.find(Dropdown).props().elements;
      actions.find(a => a.name === dropdown).action();
      const fn = dispatch.firstCall.args[0];
      expectRequest(fn, `/linodes/linode_1234${endpoint}`, getState());
    };
  }

  [
    ['reboots selected linodes when reboot is pressed', 'Reboot', '/reboot'],
    ['shuts down selected linodes when power off is pressed', 'Power Off', '/shutdown'],
    ['boots selected linodes when boot is pressed', 'Power On', '/boot'],
    ['deletes selected linodes when deletes is pressed', 'Delete', ''],
  ].map(([name, button, endpoint]) => it(name, makePowerTest(button, endpoint)));

  it('renders a "select all" checkbox', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />);
    const selectAll = page.find('.submenu');
    expect(selectAll.find('input[type="checkbox"]')).to.exist;
  });

  it('renders an "add a linode" button', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />
    );

    expect(page.find('.mainmenu Link').props())
      .to.have.property('to')
      .which.equals('/linodes/create');
  });

  it('selects all linodes when "select all" is checked', () => {
    const selected = {};
    const localDispatch = sandbox.spy(action => {
      if (action.type === TOGGLE_SELECTED) {
        selected[action.selected[0]] = true;
      }
    });

    const page = mount(
      <IndexPage
        dispatch={localDispatch}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />
    );

    const checkButton = page.find('.submenu input[type="checkbox"]');
    expect(checkButton.length).to.equal(1);
    checkButton.simulate('change');
    expect(Object.keys(selected)).to.deep.equal(Object.keys(linodes.linodes));
  });

  function testViewChange(initial, final) {
    return () => {
      const page = mount(
        <IndexPage
          dispatch={dispatch}
          view={initial}
          selected={{}}
          linodes={linodes}
        />
      );

      const listButton = page.find(`.grid-list .${final}`);
      listButton.simulate('click');
      expect(dispatch.calledWith({ type: CHANGE_VIEW, view: final }))
        .to.equal(true);
    };
  }

  it('should switch view to list when list is clicked', testViewChange('grid', 'list'));
  it('should switch view to grid when grid is clicked', testViewChange('list', 'grid'));
});
