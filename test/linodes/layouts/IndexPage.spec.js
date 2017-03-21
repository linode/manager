import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/linodes/layouts/IndexPage';
import { TOGGLE_SELECTED } from '~/linodes/actions/index';
import { api } from '@/data';
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

  it('renders a list of Linodes', () => {
    const page = mount(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        linodes={linodes}
      />
    );

    expect(page.find('.TableRow').length).to.equal(
      Object.keys(linodes.linodes).length);
  });

  it('renders a power management dropdown', () => {
    const page = shallow(
      <IndexPage
        dispatch={() => {}}
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
        selected={{ 1234: true }}
        linodes={linodes}
      />);

    dispatch.reset();

    const actions = page.find(Dropdown).props().elements;
    actions.find(a => a.name === 'Delete').action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('.btn-default').simulate('click');

    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/linode/instances/1234', { method: 'DELETE' });
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
        selected={{}}
        linodes={linodes}
      />
    );

    const checkButton = page.find('.PrimaryPage-headerRow input[type="checkbox"]');
    expect(checkButton.length).to.equal(1);
    checkButton.simulate('change');
    expect(Object.keys(selected)).to.deep.equal(Object.keys(linodes.linodes));
  });

  it('does not check "select all" if there are no Linodes', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
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
});
