import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { DiskPanel } from '~/linodes/linode/settings/advanced/components/DiskPanel';

import { testLinode, testLinode1236, testLinodeWithUnallocatedSpace } from '@/data/linodes';
import { SHOW_MODAL } from '~/actions/modal';


describe('linodes/linode/settings/components/DiskPanel', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders disks', () => {
    const panel = mount(
      <DiskPanel
        dispatch={() => {}}
        linode={testLinode1236}
      />);

    const disks = Object.values(testLinode1236._disks.disks);
    expect(panel.find('.disk-layout .disk').length).to.equal(disks.length + 1); // has free space
    const firstDisk = panel.find('.disk-layout .disk').at(0);
    expect(firstDisk.props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(disks[0].size);
    expect(panel.find('.disk').at(1).props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(disks[1].size);
    expect(firstDisk.find('button').length).to.equal(2); // has edit+delete buttons
    expect(firstDisk.contains(<p>{disks[0].size} MB</p>)).to.equal(true);
    expect(firstDisk.contains(<small>{disks[0].filesystem}</small>)).to.equal(true);
  });

  it('renders offline message', () => {
    const panel = mount(
      <DiskPanel
        dispatch={() => {}}
        linode={testLinode}
      />);

    expect(panel.contains(
      <div className="alert alert-info">
        Your Linode must be powered off to manage your disks.
      </div>)).to.equal(true);
  });

  it('renders unallocated space', () => {
    const panel = mount(
      <DiskPanel
        dispatch={() => {}}
        linode={testLinodeWithUnallocatedSpace}
      />);

    const disks = Object.values(testLinodeWithUnallocatedSpace._disks.disks);
    expect(panel.find('.disk').length).to.equal(3);
    const unallocated = panel.find('.disk').at(2);
    const free = testLinodeWithUnallocatedSpace.type.storage -
      disks.reduce((s, d) => s + d.size, 0);
    expect(unallocated.props())
      .to.have.property('style')
      .to.have.property('flexGrow')
      .which.equals(free);
    expect(unallocated.hasClass('free'))
      .to.equal(true);
  });

  it('shows the edit modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = mount(
      <DiskPanel
        dispatch={dispatch}
        linode={testLinode1236}
      />);

    const edit = panel.find('Button').at(0);
    expect(edit.text()).to.equal('Edit');
    edit.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the delete modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = mount(
      <DiskPanel
        dispatch={dispatch}
        linode={testLinode1236}
      />);

    // Two disks available to delete, delete the first disk
    const del = panel.find('Button').at(1);
    expect(del.text()).to.equal('Delete');
    del.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the add modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = mount(
      <DiskPanel
        dispatch={dispatch}
        linode={testLinodeWithUnallocatedSpace}
      />);

    const add = panel.find('Button').last();
    expect(add.text()).to.equal('Add a disk');
    add.simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
