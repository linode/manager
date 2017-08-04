import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { mount } from 'enzyme';
import React from 'react';
import { push } from 'react-router-redux';
import sinon from 'sinon';

import { AVAILABLE_DISK_SLOTS } from '~/constants';
import { EditConfigPage } from '~/linodes/linode/settings/advanced/layouts/EditConfigPage';

import { expectDispatchOrStoreErrors, expectRequest, expectObjectDeepEquals } from '@/common';
import { api } from '@/data';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/settings/advanced/layouts/EditConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = deepFreeze({
    linode: testLinode,
    config: testLinode._configs.configs[12345],
    disks: testLinode._disks.disks,
    kernels: api.kernels,
    account: { network_helper: true },
  });

  it('uses network helper default on create', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        create
        params={{ linodeLabel: 'test-linode-1233' }}
        dispatch={dispatch}
      />
    );

    expect(page.find('#enableNetworkHelper').props().checked).to.equal(true);
  });

  it('change label', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const label = page.find('#label');
    label.simulate('change', { target: { name: 'label', value: 'changed label' } });
    expect(label.props().value).to.equal('changed label');
  });

  it('change note', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const notes = page.find('#comments');
    notes.simulate('change', { target: { name: 'comments', value: 'changed note' } });
    expect(notes.props().value).to.equal('changed note');
  });

  it('change kernel', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const kernel = page.find('#kernel');
    kernel.simulate('change', { target: { name: 'kernel', value: 'linode/latest' } });
    expect(kernel.props().value).to.equal('linode/latest');
  });

  it('change network helper', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const networkHelper = page.find('#enableNetworkHelper');
    const valueWas = networkHelper.props().checked;
    networkHelper.simulate('change', { target: {
      name: 'enableNetworkHelper',
      checked: !valueWas,
      type: 'checkbox',
    } });
    expect(networkHelper.props().checked).to.equal(!valueWas);
  });

  it('change distro helper', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const distroHelper = page.find('#enableDistroHelper');
    const valueWas = distroHelper.props().checked;
    distroHelper.simulate('change', { target: {
      name: 'enableDistroHelper',
      checked: !valueWas,
      type: 'checkbox',
    } });
    expect(distroHelper.props().checked).to.equal(!valueWas);
  });

  it('change modules.dep helper', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const moduleDep = page.find('#enableModulesDepHelper');
    const valueWas = moduleDep.props().checked;
    moduleDep.simulate('change', { target: {
      name: 'enableModulesDepHelper',
      checked: !valueWas,
      type: 'checkbox',
    } });
    expect(moduleDep.props().checked).to.equal(!valueWas);
  });

  it('change updatedb helper', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const updatedb = page.find('#disableUpdatedb');
    const valueWas = updatedb.props().checked;
    updatedb.simulate('change', { target: {
      name: 'disableUpdatedb',
      checked: !valueWas,
      type: 'checkbox',
    } });
    expect(updatedb.props().checked).to.equal(!valueWas);
  });

  it('change virt mode', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const virtMode = page.find('input[name="virtMode"]').at(0);
    virtMode.simulate('change', { target: { value: 'fullvirt', name: 'virtMode' } });
    expect(virtMode.props().checked).to.equal(false);
  });

  it('change run level', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const runLevel = page.find('input[name="runLevel"]').at(0);
    runLevel.simulate('change', { target: { value: 'single', name: 'runLevel' } });
    expect(runLevel.props().checked).to.equal(false);
  });

  it('change memory limit', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const isMaxRam = page.find('input[name="isMaxRam"]');
    isMaxRam.simulate('change', { target: { checked: false, name: 'isMaxRam', type: 'checkbox' } });

    const ramLimit = page.find('#ramLimit');
    ramLimit.simulate('change', { target: { value: 1000, name: 'ramLimit' } });

    expect(isMaxRam.props().checked).to.equal(false);
    expect(ramLimit.props().value).to.equal(1000);
  });

  it('change initrd', async() => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const initrd = page.find('#initrd');
    initrd.simulate('change', { target: { value: '25669', name: 'initrd' } });
    expect(initrd.props().value).to.equal('25669');
  });

  it('renders kernel properly', async () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const kernel = page.findWhere(
      o => o.name() === 'Select' && o.props().id === 'kernel');
    const { options } = kernel.props();

    expect(options.length).to.equal(2); // Two groups
    expect(options[0].label).to.equal('Current');
    expect(options[1].label).to.equal('Deprecated');
    expect(options[0].options.length).to.equal(2);
    expect(options[0].options[0].label).to.equal('4.0.1-x86-linode55');
    expect(options[0].options[1].label).to.equal('4.0.1-x86_64-linode55');
  });

  it('renders boot device properly', () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    const device = page.findWhere(
      o => o.name() === 'Select' && o.props().id === 'root-device-select');
    const { options } = device.props();
    expect(options.length).to.equal(AVAILABLE_DISK_SLOTS.length);
    AVAILABLE_DISK_SLOTS.forEach((slot, i) => expect(options[i].value).to.equal(`/dev/${slot}`));
  });

  it('commits changes to the API', async () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );
    dispatch.reset();
    const label = page.find('FormGroup');
    label.find('#label').simulate('change', { target: { name: 'label', value: 'new label' } });
    const isMaxRam = page.find('#isMaxRam-true');
    isMaxRam.simulate('change', { target: { name: 'isMaxRam', value: true } });

    await page.find('Form').props().onSubmit({ preventDefault() {} });
    expect(dispatch.callCount).to.equal(1);
    await expectDispatchOrStoreErrors(dispatch.firstCall.args[0], [
      ([fn]) => expectRequest(fn, `/linode/instances/${testLinode.id}/configs/12345`, {
        method: 'PUT',
        body: {
          label: 'new label',
          comments: 'Test comments',
          ram_limit: 0,
          run_level: 'default',
          virt_mode: 'paravirt',
          kernel: 'linode/latest_64',
          devices: {
            sda: { disk_id: 12345 },
            sdb: { disk_id: 12346 },
            sdc: null,
            sdd: null,
            sde: null,
            sdf: null,
            sdg: null,
            sdh: null,
          },
          initrd: null,
          root_device: '/dev/sda',
          helpers: {
            disable_updatedb: true,
            enable_distro_helper: true,
            enable_network_helper: true,
            enable_modules_dep_helper: true,
          },
        },
      }),
      ([pushResult]) => expectObjectDeepEquals(
        pushResult, push(`/linodes/${props.linode.label}/settings/advanced`)),
    ], 2);
  });
});
