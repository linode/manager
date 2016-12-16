import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import ConfigSelectModal from '~/linodes/components/ConfigSelectModal';
import { powerOnLinode, rebootLinode } from '~/api/linodes';

import { api } from '@/data';

const { linodes } = api;

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

    const configElement = modal.find('label.radio input').at(1);
    configElement.simulate('change', { target: { value: 321321 } });

    modal.find('.btn-default').simulate('click');

    expect(action.callCount).to.equal(1);
    expect(action.firstCall.args[0]).to.equal(linode.id);
    expect(action.firstCall.args[1]).to.equal(321321);

    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0]).to.equal(42);
  });
});
