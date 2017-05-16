import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { AddModal } from '~/linodes/linode/settings/components/AddModal';

import { api } from '@/data';
import { testLinode1236 } from '@/data/linodes';
import { hideModal } from '~/actions/modal';
import { expectDispatchOrStoreErrors, expectRequest } from '@/common';


describe('linodes/linode/settings/components/AddModal', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const changeInput = (cmpt, id, value) =>
    cmpt.find({ id, name: id }).simulate('change', { target: { name: id, value } });

  it('should drop filesystem and render password if a distro is selected', () => {
    const modal = mount(
      <AddModal
        dispatch={() => {}}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);

    const distro = Object.keys(api.distributions.distributions)[0];
    changeInput(modal, 'distribution', distro);

    expect(modal.find('#distribution').props().value).to.equal(distro);
    expect(modal.find('#filesystem').length).to.equal(0);
    expect(modal.find('PasswordInput').length).to.equal(1);
  });

  it('should enforce the min and max sizes contextually', () => {
    const modal = mount(
      <AddModal
        dispatch={() => {}}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);
    expect(modal.find('[type="number"]').props())
      .to.have.property('min').that.equals(8);
    expect(modal.find('[type="number"]').props())
      .to.have.property('max').that.equals(4096);
    const distro = Object.values(api.distributions.distributions)[0];

    changeInput(modal, 'distribution', distro.id);
    expect(modal.find('[type="number"]').props())
      .to.have.property('min').that.equals(distro.minimum_storage_size);
  });

  it('should dismiss the modal when Cancel is clicked', async () => {
    const dispatch = sandbox.spy();
    const modal = mount(
      <AddModal
        dispatch={dispatch}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);

    modal.find('.btn-secondary').simulate('click');
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.calledWith(hideModal())).to.equal(true);
  });

  it('should POST /linode/instances/:id/disks/ when form is submitted', async () => {
    const dispatch = sandbox.spy();
    const modal = mount(
      <AddModal
        dispatch={dispatch}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);

    const distro = Object.keys(api.distributions.distributions)[0];
    changeInput(modal, 'distribution', distro);
    changeInput(modal, 'label', 'Test disk');
    changeInput(modal, 'size', '1234');
    changeInput(modal, 'password', 'hunter2');

    dispatch.reset();
    await modal.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);

    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, '/linode/instances/1236/disks/', {
        method: 'POST',
        body: {
          label: 'Test disk',
          filesystem: 'ext4',
          size: 1234,
          distribution: distro,
          root_pass: 'hunter2',
        },
      }),
    ]);
  });
});
