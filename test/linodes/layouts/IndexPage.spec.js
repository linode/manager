import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { IndexPage } from '~/linodes/layouts/IndexPage';
import { TOGGLE_SELECTED, CHANGE_VIEW } from '~/linodes/actions/index';
import { api, freshState } from '@/data';
import { testLinode } from '@/data/linodes';
import Dropdown from '~/components/Dropdown';
import { SET_ERROR } from '~/actions/errors';
import { expectRequest } from '@/common.js';
import { linodes as thunks } from '~/api';

const { linodes } = api;

describe('linodes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('handles errors from fetchLinodes', () => {
    sandbox.stub(thunks, 'page').throws({
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
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={{
          ...freshState.api.linodes,
          totalPages: 1,
        }}
      />);
    await page.instance().componentDidMount();
    expect(dispatch.calledWith(push('/linodes/create')))
      .to.equal(true);
  });

  it('renders a grid of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={{
          totalPages: 1,
          totalResults: 2,
          linodes: {
            [testLinode.id]: testLinode,
            1235: {
              ...testLinode,
              id: 1235,
              label: 'asdfasdf',
            },
          },
        }}
      />
    );

    const linodesPage = page.find('.linodes-page > .row');

    expect(linodesPage.find('.col-md-4').length).to.equal(2);

    expect(linodesPage.find('.col-md-4').first().find('a')
                  .text()).to.equal(testLinode.label);

    expect(linodesPage.find('.col-md-4').last().find('a')
                  .text()).to.equal('asdfasdf');
  });

  it('renders a list of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'list'}
        selected={{}}
        linodes={linodes}
      />
    );

    const table = page.find('table.linodes');
    expect(table.length).to.equal(2);
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
    const dropdown = page.find('Dropdown');
    expect(dropdown.length).to.equal(1);
    const elements = dropdown.props().elements;
    expect(elements.length).to.equal(4);
    const options = ['Reboot', 'Power on', 'Power off', 'Delete'];
    for (let i = 0; i < options.length; i++) {
      expect(elements[i].name).to.equal(options[i]);
    }
  });

  function makePowerTest(dropdown, endpoint) {
    return async () => {
      const page = mount(
        <IndexPage
          dispatch={dispatch}
          view={'grid'}
          selected={{ 1234: true }}
          linodes={linodes}
        />);
      dispatch.reset();
      const actions = page.find(Dropdown).props().elements;
      actions.find(a => a.name === dropdown).action();
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, `/linode/instances/1234${endpoint}`);
    };
  }

  [
    ['reboots selected linodes when reboot is pressed', 'Reboot', '/reboot'],
    ['shuts down selected linodes when power off is pressed', 'Power off', '/shutdown'],
    ['boots selected linodes when boot is pressed', 'Power on', '/boot'],
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
    expect(selectAll.find('input[type="checkbox"]').length).to.equal(1);
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
