import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { IndexPage } from '~/linodes/layouts/IndexPage';
import { UPDATE_LINODES } from '~/actions/api/linodes';
import { TOGGLE_SELECTED } from '~/linodes/actions/index';
import * as fetch from '~/fetch';
import { testLinode } from '~/../test/data';
import Dropdown from '~/components/Dropdown';

describe('linodes/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: { ...testLinode, id: 'linode_1235' },
      linode_1236: { ...testLinode, id: 'linode_1236', state: 'offline' },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };

  it('dispatches a linodes fetch action when mounted', async () => {
    mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />);
    expect(dispatch.calledOnce).to.equal(true);
    const dispatched = dispatch.firstCall.args[0];
    // Assert that dispatched is a function that fetches linodes
    const fetchStub = sandbox.stub(fetch, 'fetch').returns({
      json: () => {},
    });
    dispatch.reset();
    await dispatched(dispatch, () => ({
      authentication: { token: 'token' },
    }));
    expect(fetchStub.calledOnce).to.equal(true);
    expect(fetchStub.firstCall.args[1]).to.equal('/linodes?page=1');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0].type).to.equal(UPDATE_LINODES);
  });

  it('renders a grid of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view={'grid'}
        selected={{}}
        linodes={linodes}
      />
    );

    const gridRow = page.find('.linodes-page > .row');
    expect(gridRow.length).to.equal(1);
    expect(gridRow.find('.col-md-4').length).to.equal(
      Object.keys(linodes.linodes).length);
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

    const table = page.find('.linodes-page > .linodes > table');
    expect(table.length).to.equal(1);
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
      expect(dispatch.firstCall.args[0]).to.be.a('function');
      // Assert that dispatch was given a function that does the API request
      const dispatched = dispatch.firstCall.args[0];
      const fetchStub = sandbox.stub(fetch, 'fetch').returns({
        json: () => {},
      });
      await dispatched(dispatch, () => ({ authentication: { token: 'token' } }));
      expect(fetchStub.calledOnce).to.equal(true);
      expect(fetchStub.firstCall.args[1]).to.equal(`/linodes/linode_1234${endpoint}`);
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
    const selectAll = page.find('.selectall');
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

    const checkButton = page.find('.selectall input[type="checkbox"]');
    expect(checkButton.length).to.equal(1);
    checkButton.simulate('change');
    expect(Object.keys(selected)).to.deep.equal(Object.keys(linodes.linodes));
  });

  it('changes the view when the grid or list links are clicked');
});
