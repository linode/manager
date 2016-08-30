import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { DiskPanel } from '~/linodes/settings/components/DiskPanel';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
const { linodes } = api;

describe('linodes/settings/components/DiskPanel', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('renders disk help button', () => {
    const panel = mount(
      <DiskPanel
        params={{ linodeId: testLinode.id }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    expect(panel.find('HelpButton')).to.exist;
  });

  it('renders disks', () => {
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: testLinode.id }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    const disks = Object.values(testLinode._disks.disks);
    expect(panel.find('.disk').length).to.equal(2);
    const firstDisk = panel.find('.disk').at(0);
    expect(firstDisk.props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(disks[0].size);
    expect(panel.find('.disk').at(1).props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(disks[1].size);
    expect(firstDisk.find('.btn-default').length).to.equal(1); // has edit button
    expect(firstDisk.contains(<p>{disks[0].size} MiB</p>)).to.equal(true);
    expect(firstDisk.contains(<small>{disks[0].filesystem}</small>)).to.equal(true);
  });

  it('renders unallocated space', () => {
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: 'linode_1240' }}
        dispatch={() => {}}
        linodes={linodes}
      />
    );

    const linode = linodes.linodes.linode_1240;
    const disks = Object.values(linode._disks.disks);
    expect(panel.find('.disk').length).to.equal(3);
    const unallocated = panel.find('.disk').at(2);
    const free = linode.services[0].storage * 1024 -
      disks.reduce((s, d) => s + d.size, 0);
    expect(unallocated.props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(free);
    expect(unallocated.hasClass('free'))
      .to.equal(true);
  });
});
