import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { Disks } from '~/linodes/linode/settings/advanced/components';

import { changeInput, expectRequest } from '@/common.js';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/settings/advanced/components/Disks', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of disks', () => {
    const page = mount(
      <Disks
        dispatch={dispatch}
        selectedMap={{}}
        linode={testLinode}
      />
    );

    const disk = page.find('.TableRow');
    expect(disk.length).to.equal(Object.keys(testLinode._disks.disks).length);
    const firstDisk = disk.at(0);
    expect(firstDisk.find('td').at(1).text())
      .to.equal('Arch Linux 2015.08 Disk');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <Disks
        dispatch={dispatch}
        linode={testLinode}
        selectedMap={{}}
      />
    );

    const diskDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    diskDelete.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('deletes selected volumes when delete is pressed', async () => {
    const page = mount(
      <Disks
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
    await expectRequest(fn, `/linode/instances/${testLinode.id}/disks/12345`, { method: 'DELETE' });
  });
});
