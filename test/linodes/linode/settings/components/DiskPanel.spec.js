import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { DiskPanel } from '~/linodes/linode/settings/components/DiskPanel';
import { AddModal } from '~/linodes/linode/settings/components/AddModal';
import { EditModal } from '~/linodes/linode/settings/components/EditModal';
import { DeleteModal } from '~/linodes/linode/settings/components/DeleteModal';

import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { SHOW_MODAL, hideModal } from '~/actions/modal';
import { expectRequest } from '@/common';

const { linodes } = api;

describe('linodes/linode/settings/components/DiskPanel', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders disks', () => {
    const panel = mount(
      <DiskPanel
        params={{ linodeLabel: 'test-linode-2' }}
        dispatch={() => {}}
        linodes={linodes}
      />);

    const disks = Object.values(linodes.linodes[1236]._disks.disks);
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
    const panel = shallow(
      <DiskPanel
        params={{ linodeLabel: `${testLinode.label}` }}
        dispatch={() => {}}
        linodes={linodes}
      />);

    expect(panel.contains(
      <div className="alert alert-info">
        Your Linode must be powered off to manage your disks.
      </div>)).to.equal(true);
  });

  it('renders unallocated space', () => {
    const panel = shallow(
      <DiskPanel
        params={{ linodeLabel: 'test-linode-6' }}
        dispatch={() => {}}
        linodes={linodes}
      />);

    const linode = linodes.linodes[1240];
    const disks = Object.values(linode._disks.disks);
    expect(panel.find('.disk').length).to.equal(3);
    const unallocated = panel.find('.disk').at(2);
    const free = linode.type[0].storage -
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
    const panel = shallow(
      <DiskPanel
        params={{ linodeLabel: 'test-linode-2' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    panel.find('.LinodesLinodeSettingsComponentsDiskPanel-edit').at(0).
      simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the delete modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = shallow(
      <DiskPanel
        params={{ linodeLabel: 'test-linode-2' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    // Two disks available to delete, delete the first disk
    panel.find('.LinodesLinodeSettingsComponentsDiskPanel-delete').at(0).
      simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the add modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = mount(
      <DiskPanel
        params={{ linodeLabel: 'test-linode-6' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    panel.find('.LinodesLinodeSettingsComponentsDiskPanel-add').
      simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  describe('EditModal', () => {
    const props = {
      linode: linodes.linodes[1236],
      disk: linodes.linodes[1236]._disks.disks[12345],
      free: 0,
    };

    it('should render the label and size inputs', () => {
      const modal = mount(
        <EditModal
          {...props}
          dispatch={() => {}}
        />);

      expect(modal.find('input#label').length).to.equal(1);
      expect(modal.find('[type="number"]').length).to.equal(1);
    });

    it('should copy initial state from props on mount', () => {
      const modal = shallow(
        <EditModal
          {...props}
          dispatch={() => {}}
        />);
      modal.instance().componentDidMount();
      const disk = linodes.linodes[1236]._disks.disks[12345];
      expect(modal.state('label')).to.equal(disk.label);
      expect(modal.state('size')).to.equal(disk.size);
    });

    it('update state when fields are edited', () => {
      const modal = mount(
        <EditModal
          {...props}
          dispatch={() => {}}
        />);

      modal.find('input#label').simulate('change', {
        target: { value: 'New label' },
      });
      modal.find('[type="number"]').props().onChange({ target: { value: 1234 } });

      expect(modal.state('label')).to.equal('New label');
      expect(modal.state('size')).to.equal(1234);
    });

    it('should dismiss the modal when Cancel is clicked', () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <EditModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-secondary').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should call saveChanges when Edit Disk form is submitted', () => {
      const modal = mount(
        <EditModal
          {...props}
          dispatch={() => {}}
        />);
      const saveChanges = sandbox.stub(modal.instance(), 'saveChanges');
      modal.find('button[type="submit"]').simulate('submit');
      expect(saveChanges.calledOnce).to.equal(true);
    });

    it('should commit changes to the API', async () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <EditModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('input#label').simulate('change', {
        target: { value: 'New label' },
      });
      modal.find('[type="number"]').props().onChange({ target: { value: 1234 } });
      const { saveChanges } = modal.instance();
      await saveChanges();
      expect(dispatch.calledThrice).to.equal(true);
      const resize = dispatch.firstCall.args[0];
      const put = dispatch.secondCall.args[0];
      await expectRequest(resize, '/linode/instances/1236/disks/12345/resize', {
        method: 'POST',
        body: { size: 1234 },
      });

      await expectRequest(put, '/linode/instances/1236/disks/12345', {
        method: 'PUT',
        body: { label: 'New label' },
      });
    });

    it('should handle errors when createDisk is called', async () => {
      const dispatch = sandbox.stub();
      const modal = mount(
        <EditModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('input#label').simulate('change', {
        target: { value: 'New label' },
      });
      modal.find('[type="number"]').props().onChange({ target: { value: 1234 } });
      dispatch.onCall(0).throws({
        json() {
          return {
            errors: [
              { field: 'label', reason: 'Name error' },
              { reason: 'General error' },
            ],
          };
        },
      });
      const { saveChanges } = modal.instance();
      await saveChanges();
      const errs = modal.state('errors');
      expect(errs)
        .to.have.property('label')
        .which.deep.includes({
          field: 'label',
          reason: 'Name error',
        });
      expect(errs)
        .to.have.property('_')
        .which.deep.includes({ reason: 'General error' });
    });
  });

  describe('DeleteModal', () => {
    const props = {
      linode: linodes.linodes[1236],
      disk: linodes.linodes[1236]._disks.disks[12345],
    };

    it('should render warning text and buttons', () => {
      const modal = mount(
        <DeleteModal
          {...props}
          dispatch={() => {}}
        />);
      expect(modal.find('p').length).to.equal(1);
      expect(modal.find('.btn-secondary').length).to.equal(1);
      expect(modal.find('button').length).to.equal(2);
    });

    it('should dismiss the modal when Cancel is clicked', () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <DeleteModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-secondary').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should invoke the appropriate API endpoint', async () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <DeleteModal
          {...props}
          dispatch={dispatch}
        />);
      await modal.find('.btn-default').simulate('submit');
      expect(dispatch.calledTwice).to.equal(true);
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, '/linode/instances/1236/disks/12345', { method: 'DELETE' });
    });
  });

  describe('AddModal', () => {
    const props = {
      distributions: api.distributions,
      linode: linodes.linodes[1236],
      free: 4096,
    };

    it('should render label, filesystem, distro, and size fields', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);

      expect(modal.find('#label').length).to.equal(1);
      expect(modal.find('select').length).to.equal(2);
      expect(modal.find('[type="number"]').length).to.equal(1);
    });

    it('should drop filesystem and render password if a distro is selected', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      const distro = Object.keys(api.distributions.distributions)[0];
      modal.find('select').at(0).simulate('change', { target: { value: distro } });
      expect(modal.state('distro')).to.equal(distro);
      expect(modal.find('select').length).to.equal(1);
      expect(modal.find('PasswordInput').length).to.equal(1);
    });

    it('should handle editing password', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      const distro = Object.keys(api.distributions.distributions)[0];
      modal.find('select').at(0).simulate('change', { target: { value: distro } });
      modal.find('PasswordInput').props().onChange('hunter2');
      expect(modal.state('password')).to.equal('hunter2');
    });

    it('should handle editing filesystem', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      modal.find('select').at(1).simulate('change', { target: { value: 'swap' } });
      expect(modal.state('filesystem')).to.equal('swap');
    });

    it('should handle editing size', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      const size = modal.find('[type="number"]');
      size.props().onChange({ target: { value: '1234' } });
      expect(modal.state('size')).to.equal(1234);
      expect(size.props().value).to.equal(1234);
    });

    it('should enforce the min and max sizes contextually', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      expect(modal.find('[type="number"]').props())
        .to.have.property('min').that.equals(8);
      expect(modal.find('[type="number"]').props())
        .to.have.property('max').that.equals(4096);
      const distro = Object.values(api.distributions.distributions)[0];
      modal.find('select').at(0).simulate('change', { target: { value: distro.id } });
      expect(modal.find('[type="number"]').props())
        .to.have.property('min').that.equals(distro.minimum_storage_size);
    });

    it('should dismiss the modal when Cancel is clicked', async () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <AddModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-secondary').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should call createDisk when Add Disk form is submitted', () => {
      const modal = mount(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      const createDisk = sandbox.stub(modal.instance(), 'createDisk');
      modal.find('.btn-default').simulate('submit');
      expect(createDisk.calledOnce).to.equal(true);
    });

    it('should POST /linode/instances/:id/disks/ when createDisk is called', async () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <AddModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('#label').simulate('change', { target: { value: 'Test disk' } });
      dispatch.reset();
      const { createDisk } = modal.instance();
      await createDisk();
      expect(dispatch.calledTwice).to.equal(true);
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, '/linode/instances/1236/disks/', {
        method: 'POST',
        body: {
          label: 'Test disk',
          size: 1024,
          filesystem: 'ext4',
          distribution: null,
          root_pass: '',
        },
      });
    });

    it('should handle errors when createDisk is called', async () => {
      const dispatch = sandbox.stub();
      const modal = mount(
        <AddModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('#label').simulate('change', { target: { value: 'Test disk' } });
      dispatch.onCall(0).throws({
        json() {
          return {
            errors: [
              { field: 'label', reason: 'Name error' },
              { field: 'size', reason: 'Size error' },
              { reason: 'General error' },
            ],
          };
        },
      });
      const { createDisk } = modal.instance();
      await createDisk();
      const errs = modal.state('errors');
      expect(errs).to.have.deep.property('label');
      expect(errs.label[0].reason).to.equal('Name error');
      expect(errs).to.have.property('size');
      expect(errs.size[0].reason).to.equal('Size error');
      expect(errs).to.have.property('_');
      expect(errs._[0].reason).to.equal('General error');
    });
  });
});
