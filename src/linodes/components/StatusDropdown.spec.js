import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import StatusDropdown from '~/linodes/components/StatusDropdown';

import { SHOW_MODAL } from '~/actions/modal';

import { expectRequest } from '~/test.helpers';
import { api } from '~/data';


const { linodes } = api;

describe('linodes/components/StatusDropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const wrapper = shallow(
      <StatusDropdown linode={linodes.linodes[1236]} dispatch={() => {}} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('renders correct options for offline Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1236]} dispatch={() => {}} />
    );

    expect(dropdown.find('.Dropdown-first').text().trim()).toBe('Offline');

    dropdown.find('.Dropdown-toggle').simulate('click');

    expect(dropdown.find('.Dropdown-item').length).toBe(3);
    expect(dropdown.find('.Dropdown-item').at(0).text()).toBe('Power On');
    expect(dropdown.find('.Dropdown-item').at(1).text()).toBe('Launch Console');
    expect(dropdown.find('.Dropdown-item').at(2).text()).toBe('Delete');
  });

  it.skip('renders correct options for online Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    expect(dropdown.find('.Dropdown-first').text().trim()).toBe('Running');

    dropdown.find('.Dropdown-toggle').simulate('click');

    expect(dropdown.find('.Dropdown-item').length).toBe(4);
    expect(dropdown.find('.Dropdown-item').at(0).text()).toBe('Reboot');
    expect(dropdown.find('.Dropdown-item').at(1).text()).toBe('Power Off');
    expect(dropdown.find('.Dropdown-item').at(2).text()).toBe('Launch Console');
    expect(dropdown.find('.Dropdown-item').at(3).text()).toBe('Delete');
  });

  it.skip('renders correct options for provisioning Linodes', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1248]} dispatch={() => {}} />
    );

    expect(dropdown.find('.Dropdown-first').text().trim()).toBe('Provisioning');

    dropdown.find('.Dropdown-toggle').simulate('click');

    expect(dropdown.find('.Dropdown-item').length).toBe(2);
    expect(dropdown.find('.Dropdown-item').at(0).text()).toBe('Launch Console');
    expect(dropdown.find('.Dropdown-item').at(1).text()).toBe('Delete');
  });

  it.skip('dispatches on item click', async () => {
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

  it.skip('is in a rebooting state, progressbar should show up', async () => {
    const dispatch = sandbox.spy();
    const progress = mount(
      <StatusDropdown linode={linodes.linodes[1237]} dispatch={dispatch} />
    );
    expect(progress.find('.StatusDropdown-progress').length).toBe(1);
  });

  it.skip('shows unrecognized status as offline', async () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1243]} dispatch={dispatch} />
    );
    expect(dropdown.find('.Dropdown-first').text().trim()).toBe('Offline');
  });

  it.skip('renders modal on reboot if multiple configs', () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes['1233']} dispatch={dispatch} />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0].type).toBe(SHOW_MODAL);
  });

  it.skip('renders modal on power on if multiple configs', () => {
    const dispatch = sandbox.spy();
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes['1238']} dispatch={dispatch} />
    );

    dropdown.find('.Dropdown-toggle').simulate('click');
    dropdown.find('.Dropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0].type).toBe(SHOW_MODAL);
  });
});
