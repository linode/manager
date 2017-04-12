import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { IndexPage } from '~/linodes/layouts/IndexPage';
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
        selectedMap={{}}
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
        selectedMap={{}}
        linodes={linodes}
      />
    );

    expect(page.find('.TableRow').length).to.equal(
      Object.keys(linodes.linodes).length);
  });

  it('renders a power management dropdown', () => {
    const page = mount(
      <IndexPage
        dispatch={() => {}}
        selectedMap={{}}
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
          selectedMap={{ 1234: true }}
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
        selectedMap={{ 1234: true }}
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
});
