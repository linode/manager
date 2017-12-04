import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import AddDisk from '~/linodes/linode/settings/advanced/components/AddDisk';

import { api } from '~/data';
import { testLinode1236 } from '~/data/linodes';
import { hideModal } from '~/actions/modal';
import { changeInput, expectDispatchOrStoreErrors, expectRequest } from '~/test.helpers';


describe('linodes/linode/settings/advanced/components/AddDisk', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it.skip('should drop filesystem and render password if a distro is selected', () => {
    const modal = mount(
      <AddDisk
        dispatch={() => { }}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);

    const distro = Object.keys(api.distributions.distributions)[0];
    changeInput(modal, 'distribution', distro);

    expect(modal.find('#distribution').props().value).toBe(distro);
    expect(modal.find('#filesystem').length).toBe(0);
    expect(modal.find('PasswordInput').length).toBe(1);
  });

  it.skip('should enforce the min and max sizes contextually', () => {
    const modal = mount(
      <AddDisk
        dispatch={() => { }}
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
      .to.have.property('min').that.equals(distro.disk_minimum);
  });

  it.skip('should dismiss the modal when Cancel is clicked', async () => {
    const dispatch = sandbox.spy();
    const modal = mount(
      <AddDisk
        dispatch={dispatch}
        linode={testLinode1236}
        free={4096}
        distributions={api.distributions}
      />);

    modal.find('CancelButton').simulate('click');

    expect(dispatch.callCount).toBe(1);
    expect(dispatch.calledWith(hideModal())).toBe(true);
  });

  it.skip(
    'should POST /linode/instances/:id/disks/ create disk from and only list distro',
    async () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <AddDisk
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
      await modal.find('Form').props().onSubmit({ preventDefault() { } });
      expect(dispatch.callCount).toBe(1);
      expect(modal.find('#distribution').at(0).find('optgroup').length).toBe(2);
      expect(modal.find('#distribution').at(0).find('option').length).toBe(5);

      await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
        ([fn]) => expectRequest(fn, '/linode/instances/1236/disks/', {
          method: 'POST',
          body: {
            label: 'Test disk',
            filesystem: 'ext4',
            size: 1234,
            distribution: distro,
            image: null,
            root_pass: 'hunter2',
          },
        }),
      ]);
    });

  it.skip(
    'should POST /linode/instances/:id/disks/ create disk from image and list all',
    async () => {
      const dispatch = sandbox.spy();
      const modal = mount(
        <AddDisk
          dispatch={dispatch}
          linode={testLinode1236}
          free={4096}
          distributions={api.distributions}
          images={{ images: api.images }}
        />);

      changeInput(modal, 'distribution', 38);
      changeInput(modal, 'label', 'Test disk');
      changeInput(modal, 'size', '1234');
      changeInput(modal, 'password', 'hunter2');

      dispatch.reset();
      await modal.find('Form').props().onSubmit({ preventDefault() { } });
      expect(dispatch.callCount).toBe(1);
      expect(modal.find('#distribution').at(0).find('optgroup').length).toBe(3);
      expect(modal.find('#distribution').at(0).find('option').length).toBe(6);

      await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
        ([fn]) => expectRequest(fn, '/linode/instances/1236/disks/', {
          method: 'POST',
          body: {
            label: 'Test disk',
            filesystem: 'ext4',
            size: 1234,
            distribution: null,
            image: 38,
            root_pass: 'hunter2',
          },
        }),
      ]);
    });
});
