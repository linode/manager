import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import
  StatusDropdown,
  { ConfigSelectModal } from '~/linodes/components/StatusDropdown';
import { powerOnLinode, rebootLinode } from '~/api/linodes';

import { expectRequest } from '@/common';
import { api } from '@/data';

import { SHOW_MODAL } from '~/actions/modal';
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

    expect(dropdown.find('.StatusDropdown-status').text()).to.equal('Offline');

    dropdown.find('.StatusDropdown-toggle').simulate('click');

    expect(dropdown.find('.StatusDropdown-item').length).to.equal(2);
    expect(dropdown.find('.StatusDropdown-item').at(0).text()).
      to.contain('Power on');
  });

  it('renders correct options for online Linodes', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    expect(dropdown.find('.StatusDropdown-status').text()).to.equal('Running');

    dropdown.find('.StatusDropdown-toggle').simulate('click');

    expect(dropdown.find('.StatusDropdown-item').length).to.equal(3);
    expect(dropdown.find('.StatusDropdown-item').at(0).text()).to.contain('Reboot');
    expect(dropdown.find('.StatusDropdown-item').at(1).text()).
      to.contain('Power off');
  });

  it('closes on second click', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(1);

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(0);
  });

  it('closes on blur', () => {
    const dropdown = mount(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(1);

    dropdown.find('.StatusDropdown-toggle').simulate('blur');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(0);
  });

  it('closes on item click', () => {
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={() => {}} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(1);

    dropdown.find('.StatusDropdown-item').first().simulate('mousedown');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(0);
  });

  it('dispatches on item click', async () => {
    const dispatch = sinon.spy();
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1235]} dispatch={dispatch} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    expect(dropdown.find('.StatusDropdown--open').length).to.equal(1);

    dropdown.find('.StatusDropdown-item').first().simulate('mousedown');
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
    expect(progress.find('.StatusDropdown-progress').length).to.equal(1);
  });

  it('shows unrecognized status as offline', async () => {
    const dispatch = sinon.spy();
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1243]} dispatch={dispatch} />
    );
    expect(dropdown.find('.StatusDropdown-status').text()).to.equal('Offline');
  });

  it('renders modal on reboot if multiple configs', () => {
    const dispatch = sinon.spy();
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1238]} dispatch={dispatch} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    dropdown.find('.StatusDropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('renders modal on power on if multiple configs', () => {
    const dispatch = sinon.spy();
    const dropdown = shallow(
      <StatusDropdown linode={linodes.linodes[1244]} dispatch={dispatch} />
    );

    dropdown.find('.StatusDropdown-toggle').simulate('click');
    dropdown.find('.StatusDropdown-item').first().simulate('mousedown');
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});

describe('linodes/components/StatusDropdown/ConfigSelectModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders power on button text', () => {
    const modal = shallow(
      <ConfigSelectModal
        linode={linodes.linodes[1244]}
        action={powerOnLinode}
      />
    );

    expect(modal.find('.btn-default').text()).to.equal('Power on');
  });

  it('renders reboot button text', () => {
    const modal = shallow(
      <ConfigSelectModal
        linode={linodes.linodes[1244]}
        action={rebootLinode}
      />
    );

    expect(modal.find('.btn-default').text()).to.equal('Reboot');
  });

  it('renders config list', () => {
    const linode = linodes.linodes[1244];
    const modal = shallow(<ConfigSelectModal linode={linode} />);

    const configs = Object.values(linode._configs.configs);
    const elements = modal.find('label.radio');
    expect(elements.length).to.equal(configs.length);

    for (let i = 0; i < configs.length; i++) {
      const element = elements.at(i);
      expect(element.find('span').text()).to.equal(configs[i].label);
      expect(element.find('input').props().value).to.equal(configs[i].id);
    }
  });

  it('dispatches action when button is pressed', () => {
    const dispatch = sandbox.spy();
    const action = sandbox.stub().returns(42);

    const linode = linodes.linodes[1244];

    const modal = shallow(
      <ConfigSelectModal
        linode={linode}
        action={action}
        dispatch={dispatch}
      />
    );

    const configElement = modal.find('label.radio').at(1);
    configElement.simulate('click');

    modal.find('.btn-default').simulate('click');

    expect(action.callCount).to.equal(1);
    expect(
      action.calledWith(linode, configElement.find('input').props().value));

    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.calledWith(42));
  });
});
