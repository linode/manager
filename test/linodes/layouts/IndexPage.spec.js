import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import _ from 'lodash';

import { IndexPage } from '~/linodes/layouts/IndexPage';
import { TOGGLE_SELECTED, CHANGE_VIEW } from '~/linodes/actions/index';
import { api, state, freshState } from '@/data';
import { testLinode } from '@/data/linodes';
import Dropdown from '~/components/Dropdown';
import { SET_ERROR } from '~/actions/errors';
import { expectRequest } from '@/common.js';
import { linodes as thunks } from '~/api';
import { actions as linodeActions } from '~/api/configs/linodes';
import { OBJECT_POLLING_INTERVAL } from '~/constants';

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
        view="grid"
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

  it('calls attachLinodesTimeout and setSourceLink on mount', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        view="grid"
        selected={{}}
        linodes={linodes}
      />
    );

    const attachLinodesTimeoutStub = sandbox.stub(page.instance(), 'attachLinodesTimeout');
    const setSourceLinkStub = sandbox.stub(page.instance(), 'setSourceLink');

    page.instance().componentDidMount();

    expect(attachLinodesTimeoutStub.calledOnce).to.equal(true);
    expect(setSourceLinkStub.calledOnce).to.equal(true);
  });

  it('clears the timeout on unmount', () => {
    const clearTimeoutStub = sandbox.stub(window, 'clearTimeout');

    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        view="grid"
        selected={{}}
        linodes={linodes}
      />
    );

    page.instance()._eventTimeout = 12;
    page.instance().componentWillUnmount();

    expect(clearTimeoutStub.calledOnce).to.equal(true);
    expect(clearTimeoutStub.firstCall.args[0]).to.equal(12);
  });

  it('attaches the linode timeout', async () => {
    const _dispatch = sandbox.stub();

    const page = shallow(
      <IndexPage
        dispatch={_dispatch}
        view="grid"
        selected={{}}
        linodes={linodes}
      />
    );

    const setTimeoutStub = sandbox.stub(window, 'setTimeout', (resolve, delay) => {
      expect(delay).to.equal(OBJECT_POLLING_INTERVAL);
      resolve();
    });

    // Save the original function for future use.
    const originalAttachLinodesTimeout = page.instance().attachLinodesTimeout.bind(page.instance());

    let firstTime = true;
    let attachLinodesTimeoutStub;
    // Wrapper to promisify the non-async stub
    const r = new Promise(resolve => {
      attachLinodesTimeoutStub = sandbox.stub(page.instance(), 'attachLinodesTimeout', async () => {
        // Prevent this function from looping.
        if (firstTime) {
          firstTime = false;
          await originalAttachLinodesTimeout();
          resolve();
        }
      });
    });

    _dispatch.reset();
    page.instance().attachLinodesTimeout();
    await r;

    expect(setTimeoutStub.calledOnce).to.equal(true);
    // call to invalidate + call to linodes.all + calls to delete all linodes
    const numCalls = 2 + Object.keys(state.api.linodes.linodes).length;
    expect(_dispatch.callCount).to.equal(numCalls);

    // We'll reset _dispatch later
    const oldArgs = _dispatch.args;

    // invalidate call was made
    expect(oldArgs[0][0]).to.deep.equal(linodeActions.invalidate([], true));

    // fetch all call was made
    let fn = _dispatch.args[1][0];
    _dispatch.reset();
    _dispatch.returns({ total_pages: 1, linodes: [], total_results: 0 });
    await fn(_dispatch, () => freshState);
    fn = _dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/?page=1', undefined, {
      linodes: [],
    });

    // N delete calls were made
    const sortedLinodes = _.sortBy(Object.values(state.api.linodes.linodes), 'id');
    for (let i = 2; i < numCalls; i += 1) {
      const linodeAtIndex = sortedLinodes[i - 2];
      expect(oldArgs[i][0]).to.deep.equal(linodeActions.delete(linodeAtIndex.id));
    }

    expect(attachLinodesTimeoutStub.calledTwice).to.equal(true);
  });

  it('filters fetched linodes', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        view="grid"
        selected={{}}
        linodes={linodes}
      />
    );

    const deletedLinodes = { 1234: 1 };
    const filterClosure = page.instance().filterLinodeUpdates(deletedLinodes);
    dispatch.reset();

    filterClosure({ id: 1234, status: 'booting' });
    expect(deletedLinodes['1234']).to.equal(undefined);
    expect(dispatch.calledOnce).to.equal(true);
  });

  it('renders a grid of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view="grid"
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

    expect(linodesPage.find('.col-md-6').length).to.equal(2);
    expect(linodesPage.find('.linode-label').first()
                  .text()).to.equal(testLinode.label);
    expect(linodesPage.find('.linode-label').last()
                  .text()).to.equal('asdfasdf');
  });

  it('renders a list of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view="list"
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
        view="grid"
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
          view="grid"
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
  ].map(([name, button, endpoint]) => it(name, makePowerTest(button, endpoint)));

  it('deletes selected linodes when delete is pressed', async () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        view="grid"
        selected={{ 1234: true }}
        linodes={linodes}
      />);

    dispatch.reset();

    const actions = page.find(Dropdown).props().elements;
    actions.find(a => a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('.btn-danger').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234', () => {}, null,
      options => {
        expect(options.method).to.equal('DELETE');
      }
    );
  });

  it('renders a "select all" checkbox', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
        view="grid"
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
        view="grid"
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
        view="grid"
        selected={{}}
        linodes={linodes}
      />
    );

    const checkButton = page.find('.submenu input[type="checkbox"]');
    expect(checkButton.length).to.equal(1);
    checkButton.simulate('change');
    expect(Object.keys(selected)).to.deep.equal(Object.keys(linodes.linodes));
  });

  it('does not check "select all" if there are no Linodes', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        view="grid"
        selected={{}}
        linodes={{
          linodes: {},
          totalPages: 1,
          totalResults: 0,
        }}
      />
    );

    const checkbox = page.find('.input-group-addon input[type="checkbox"]');
    expect(checkbox.props().checked).to.equal(false);
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
