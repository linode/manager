import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import StatusDropdown from '~/linodes/components/StatusDropdown';

import { SHOW_MODAL } from '~/actions/modal';

import { expectRequest } from '@/common';
import { api } from '@/data';


const { linodes } = api;

describe('linodes/components/StatusDropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders correct options for offline Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1236]} dispatch={() => {}} />
    );

    expect(dropdown.find('.Dropdown-first').text().trim()).to.equal('Offline');

    dropdown.find('.Dropdown-toggle').simulate('click');

    expect(dropdown.find('.Dropdown-item').length).to.equal(3);
    expect(dropdown.find('.Dropdown-item').at(0).text()).to.equal('Power On');
    expect(dropdown.find('.Dropdown-item').at(1).text()).to.equal('Launch Console');
    expect(dropdown.find('.Dropdown-item').at(2).text()).to.equal('Delete');
  });

  it('renders correct options for online Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    expect(dropdown.find('.Dropdown-first').text().trim()).to.equal('Running');

    dropdown.find('.Dropdown-toggle').simulate('click');

    expect(dropdown.find('.Dropdown-item').length).to.equal(4);
    expect(dropdown.find('.Dropdown-item').at(0).text()).to.equal('Reboot');
    expect(dropdown.find('.Dropdown-item').at(1).text()).to.equal('Power Off');
    expect(dropdown.find('.Dropdown-item').at(2).text()).to.equal('Launch Console');
    expect(dropdown.find('.Dropdown-item').at(3).text()).to.equal('Delete');
  });

  it('dispatches on item click', async () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={dispatch} />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    const modal = mount(dispatch.firstCall.args[0].body);
    await modal.find('Form').props().onSubmit();
    const reboot = dispatch.secondCall.args[0];
    await expectRequest(reboot, '/linode/instances/1235/reboot', { method: 'POST' });
  });

  it('is in a rebooting state, progressbar should show up', async () => {
    const dispatch = sandbox.spy();
    const progress = mount(
      <StatusDropdown linode={linodes.linodes[1237]} dispatch={dispatch} />
    );
    expect(progress.find('.StatusDropdown-progress').length).to.equal(1);
  });

  it('shows unrecognized status as offline', async () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1243]} dispatch={dispatch} />
    );
    expect(dropdown.find('.Dropdown-first').text().trim()).to.equal('Offline');
  });

  it('renders modal on reboot if multiple configs', () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes['1233']} dispatch={dispatch} />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });

  it('renders modal on power on if multiple configs', () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes['1238']} dispatch={dispatch} />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0].type).to.equal(SHOW_MODAL);
  });
});
