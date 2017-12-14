import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { powerOnLinode, rebootLinode } from '~/api/ad-hoc/linodes';
import ConfigSelectModalBody from '~/linodes/components/ConfigSelectModalBody';

import { changeInput, expectDispatchOrStoreErrors } from '~/test.helpers';
import { api } from '~/data';


const { linodes } = api;

describe('linodes/components/ConfigSelectModalBody', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should render without error', () => {
    const wrapper = shallow(
      <ConfigSelectModalBody
        linode={linodes.linodes['1238']}
        action={powerOnLinode}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it.skip('renders power on button text', () => {
    const modal = shallow(
      <ConfigSelectModalBody
        linode={linodes.linodes['1238']}
        action={powerOnLinode}
      />
    );

    expect(modal.props().buttonText).toBe('Power On');
  });

  it.skip('renders reboot button text', () => {
    const modal = shallow(
      <ConfigSelectModalBody
        linode={linodes.linodes['1238']}
        action={rebootLinode}
      />
    );

    expect(modal.props().buttonText).toBe('Reboot');
  });

  it.skip('renders config list', () => {
    const linode = linodes.linodes['1238'];
    const modal = shallow(<ConfigSelectModalBody linode={linode} />);

    const configs = Object.values(linode._configs.configs);
    const elements = modal.find('Radio');
    expect(elements.length).toBe(configs.length);

    for (let i = 0; i < configs.length; i++) {
      const element = elements.at(i);
      expect(element.props().label).toBe(configs[i].label);
      expect(element.props().value).toBe(configs[i].id);
    }
  });

  it.skip('dispatches action when button is pressed', () => {
    const dispatch = sandbox.spy();
    const action = sandbox.stub().returns(42);

    const linode = linodes.linodes['1238'];

    const modal = mount(
      <ConfigSelectModalBody
        linode={linode}
        action={action}
        dispatch={dispatch}
      />
    );

    changeInput(modal, 'config', 321321);

    dispatch.reset();
    modal.find('FormModalBody').props().onSubmit();

    expect(dispatch.callCount).toBe(1);
    expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      () => {
        expect(action.callCount).toBe(1);
        expect(action.firstCall.args[0]).toBe(linode.id);
        expect(action.firstCall.args[1]).toBe(321321);
      },
    ]);
  });
});
