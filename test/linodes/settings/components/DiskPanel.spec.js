import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { EditModal, DiskPanel } from '~/linodes/settings/components/DiskPanel';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { SHOW_MODAL, hideModal } from '~/actions/modal';
import { expectRequest } from '@/common';
const { linodes } = api;

describe('linodes/settings/components/DiskPanel', () => {
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

    expect(panel.find('HelpButton')).to.exist;
  });

  it('renders disks', () => {
    const panel = shallow(
      <DiskPanel
        params={{ linodeId: '1236' }}
        dispatch={() => {}}
        linodes={linodes}
      />);

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
    expect(firstDisk.find('button').length).to.equal(2); // has edit+delete buttons
    expect(firstDisk.contains(<p>{disks[0].size} MiB</p>)).to.equal(true);
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
      <div className="alert alert-info" style={{ marginTop: '1rem' }}>
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
    const free = linode.services[0].storage * 1024 -
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
      expect(modal.find('Slider').length).to.equal(1);
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
      modal.find('Slider').props().onChange(1234);

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
      modal.find('.btn-default').simulate('click');
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
      modal.find('Slider').props().onChange(1234);
      const { saveChanges } = modal.instance();
      await saveChanges();
      expect(dispatch.calledThrice).to.equal(true);
      const put = dispatch.firstCall.args[0];
      const resize = dispatch.secondCall.args[0];
      await expectRequest(put, '/linodes/1236/disks/12345',
        () => {}, null, options => {
          expect(options.method).to.equal('PUT');
          expect(options.body).to.equal(JSON.stringify({ label: 'New label' }));
        });
      await expectRequest(resize, '/linodes/1236/disks/12345/resize',
        () => {}, null, options => {
          expect(options.method).to.equal('POST');
          expect(options.body).to.equal(JSON.stringify({ size: 1234 }));
        });
    });
  });
});
