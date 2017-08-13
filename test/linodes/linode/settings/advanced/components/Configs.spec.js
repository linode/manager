import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { Configs } from '~/linodes/linode/settings/advanced/components';

import { changeInput, expectRequest } from '@/common.js';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/settings/advanced/components/Configs', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of configs', () => {
    const page = mount(
      <Configs
        dispatch={dispatch}
        selectedMap={{}}
        linode={testLinode}
      />
    );

    const config = page.find('.TableRow');
    expect(config.length).to.equal(Object.keys(testLinode._configs.configs).length);
    const firstConfig = config.at(0);
    expect(firstConfig.find('td').at(1).text())
      .to.equal('Test config');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <Configs
        dispatch={dispatch}
        linode={testLinode}
        selectedMap={{}}
      />
    );

    const configDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    configDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected volumes when delete is pressed', async () => {
    const page = mount(
      <Configs
        dispatch={dispatch}
        linode={testLinode}
        selectedMap={{ 12345: true }}
      />
    );

    dispatch.reset();
    page.find('MassEditControl').find('Dropdown').props().groups[0].elements[0].action();

    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit();
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, `/linode/instances/${testLinode.id}/configs/12345`, { method: 'DELETE' });
  });
});
