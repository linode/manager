import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import {
  AddModal,
  DeleteModal,
  EditModal,
  DiskPanel,
} from '~/linodes/linode/settings/components/DiskPanel';
import { api, freshState } from '@/data';
import { testLinode } from '@/data/linodes';
import { SHOW_MODAL, hideModal } from '~/actions/modal';
import { expectRequest } from '@/common';
const { linodes } = api;

describe('linodes/linode/settings/components/DiskPanel', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders disk help button', () => {
    const panel = mount(
      <DiskPanel
        params={{ linodeId: `${testLinode.id}` }}
        dispatch={() => {}}
        linodes={linodes}
      />);

    expect(panel.find('HelpButton').length).to.equal(1);
  });

  it('renders disks', () => {
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: '1236' }}
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
        params={{ linodeId: `${testLinode.id}` }}
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
        params={{ linodeId: '1240' }}
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
        params={{ linodeId: '1236' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    panel.find('.btn-edit').at(0).simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the delete modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: '1236' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    panel.find('.btn-delete').at(0).simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });

  it('shows the add modal when appropriate', () => {
    const dispatch = sandbox.spy();
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: '1240' }}
        dispatch={dispatch}
        linodes={linodes}
      />);

    panel.find('.btn-add').simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
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
      const modal = shallow(
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
      const modal = shallow(
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

    it('should close when Nevermind is clicked', () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <EditModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-cancel').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should call saveChanges when Save is clicked', () => {
      const modal = shallow(
        <EditModal
          {...props}
          dispatch={() => {}}
        />);
      const saveChanges = sandbox.stub(modal.instance(), 'saveChanges');
      modal.find('.btn-primary').simulate('click');
      expect(saveChanges.calledOnce).to.equal(true);
    });

    it('should commit changes to the API', async () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
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
      await expectRequest(resize, '/linode/instances/1236/disks/12345/resize',
        () => {}, null, options => {
          expect(options.method).to.equal('POST');
          expect(options.body).to.equal(JSON.stringify({ size: 1234 }));
        });
      await expectRequest(put, '/linode/instances/1236/disks/12345',
        () => {}, null, options => {
          expect(options.method).to.equal('PUT');
          expect(options.body).to.equal(JSON.stringify({ label: 'New label' }));
        });
    });

    it('should handle errors when createDisk is called', async () => {
      const dispatch = sandbox.stub();
      const modal = shallow(
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
              { field: 'label', reason: 'You suck at naming things' },
              { reason: 'You suck at things in general' },
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
          reason: 'You suck at naming things',
        });
      expect(errs)
        .to.have.property('_')
        .which.deep.includes({ reason: 'You suck at things in general' });
    });
  });

  describe('DeleteModal', () => {
    const props = {
      linode: linodes.linodes[1236],
      disk: linodes.linodes[1236]._disks.disks[12345],
    };

    it('should render warning text and buttons', () => {
      const modal = shallow(
        <DeleteModal
          {...props}
          dispatch={() => {}}
        />);

      expect(modal.find('p').length).to.equal(1);
      expect(modal.find('.btn-cancel').length).to.equal(1);
      expect(modal.find('button').length).to.equal(1);
    });

    it('should close when Nevermind is clicked', () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <DeleteModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-cancel').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should invoke the appropriate API endpoint', async () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <DeleteModal
          {...props}
          dispatch={dispatch}
        />);
      await modal.find('.btn-danger').props().onClick();
      expect(dispatch.calledTwice).to.equal(true);
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, '/linode/instances/1236/disks/12345',
        () => {}, null, { method: 'DELETE' });
    });
  });

  describe('AddModal', () => {
    const props = {
      distributions: api.distributions,
      linode: linodes.linodes[1236],
      free: 4096,
    };

    it('should fetch distributions on mount', async () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <AddModal
          {...props}
          distributions={freshState.api.distributions}
          dispatch={dispatch}
        />);
      await modal.instance().componentDidMount();
      expect(dispatch.calledOnce).to.equal(true);
      let fn = dispatch.firstCall.args[0];
      dispatch.reset();
      await fn(dispatch, () => freshState);
      fn = dispatch.firstCall.args[0];
      await expectRequest(fn, '/linode/distributions/?page=1',
        () => {}, { totalPages: 1, distributions: [] },
        null, freshState);
    });

    it('should render label, filesystem, distro, and size fields', () => {
      const modal = shallow(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      expect(modal.find('#label').length).to.equal(1);
      expect(modal.find('select').length).to.equal(2);
      expect(modal.find('[type="number"]').length).to.equal(1);
    });

    it('should drop filesystem and render password if a distro is selected', () => {
      const modal = shallow(
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
      const modal = shallow(
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
      const modal = shallow(
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
      const modal = shallow(
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

    it('should dismiss the modal when Nevermind is clicked', () => {
      const dispatch = sandbox.spy();
      const modal = shallow(
        <AddModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('.btn-cancel').simulate('click');
      expect(dispatch.calledOnce).to.equal(true);
      expect(dispatch.calledWith(hideModal())).to.equal(true);
    });

    it('should call createDisk when Add disk is clicked', () => {
      const modal = shallow(
        <AddModal
          {...props}
          dispatch={() => {}}
        />);
      const createDisk = sandbox.stub(modal.instance(), 'createDisk');
      modal.find('.btn-primary').simulate('click');
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
      await expectRequest(fn, '/linode/instances/1236/disks/',
        () => {}, null, options => {
          expect(options.method).to.equal('POST');
          expect(JSON.parse(options.body)).to.deep.equal({
            label: 'Test disk',
            size: 1024,
            filesystem: 'ext4',
            distribution: null,
            root_pass: '',
          });
        });
    });

    it('should handle errors when createDisk is called', async () => {
      const dispatch = sandbox.stub();
      const modal = shallow(
        <AddModal
          {...props}
          dispatch={dispatch}
        />);
      modal.find('#label').simulate('change', { target: { value: 'Test disk' } });
      dispatch.onCall(0).throws({
        json() {
          return {
            errors: [
              { field: 'label', reason: 'You suck at naming things' },
              { field: 'size', reason: 'You suck at sizing things' },
              { reason: 'You suck at things in general' },
            ],
          };
        },
      });
      const { createDisk } = modal.instance();
      await createDisk();
      const errs = modal.state('errors');
      expect(errs)
        .to.have.property('label')
        .which.includes('You suck at naming things');
      expect(errs)
        .to.have.property('size')
        .which.includes('You suck at sizing things');
      expect(errs)
        .to.have.property('_')
        .which.includes('You suck at things in general');
    });
  });
});
