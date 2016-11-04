import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import StatusDropdown from '~/linodes/components/StatusDropdown';

import { expectRequest } from '@/common';
import { api } from '@/data';

const { linodes } = api;

describe('linodes/components/StatusDropdown', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders correct options for offline Linodes', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1236]} dispatch={() => {}} />
    );

    expect(dropdown.find('.dropdown-toggle span').text()).to.equal('Offline');

    dropdown.find('.dropdown-toggle').simulate('click');

    expect(dropdown.find('.dropdown-item').length).to.equal(2);
    expect(dropdown.find('.dropdown-item').at(0).text()).
      to.contain('Power on');
  });

  it('renders correct options for online Linodes', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    expect(dropdown.find('.dropdown-toggle span').text()).to.equal('Running');

    dropdown.find('.dropdown-toggle').simulate('click');

    expect(dropdown.find('.dropdown-item').length).to.equal(3);
    expect(dropdown.find('.dropdown-item').at(0).text()).to.contain('Reboot');
    expect(dropdown.find('.dropdown-item').at(1).text()).
      to.contain('Power off');
  });

  it('closes on second click', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('closes on blur', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);

    dropdown.find('.dropdown-toggle').simulate('blur');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('closes on item click', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);

    dropdown.find('.dropdown-item').first().simulate('mousedown');
    expect(dropdown.find('.btn-group.open').length).to.equal(0);
  });

  it('dispatches on item click', async () => {
    const dispatch = sinon.spy();
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={dispatch} />
    );

    dropdown.find('.dropdown-toggle').simulate('click');
    expect(dropdown.find('.btn-group.open').length).to.equal(1);

    dropdown.find('.dropdown-item').first().simulate('mousedown');
    const reboot = dispatch.firstCall.args[0];
    await expectRequest(reboot, '/linode/instances/1235/reboot',
      () => {}, null, options => {
        expect(options.method).to.equal('POST');
      });
  });

  it('is in a rebooting state, progressbar should show up', async () => {
    const dispatch = sinon.spy();
    const progress = shallow(
      <StatusDropdown linode={linodes.linodes[1237]} dispatch={dispatch} />
    );
    expect(progress.find('.progress').length).to.equal(1);
  });
});
