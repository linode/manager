import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';
import deepFreeze from 'deep-freeze';

import { api, state } from '@/data';
import { testLinode, testLinode1233 } from '@/data/linodes';
import { expectRequest, expectObjectDeepEquals } from '@/common';
import { EditConfigPage } from '~/linodes/linode/settings/layouts/EditConfigPage';

describe('linodes/linode/settings/layouts/EditConfigPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = deepFreeze({
    linode: testLinode,
    config: testLinode._configs.configs[12345],
    kernels: api.kernels,
    account: {
      network_helper: true,
    },
  });

  it('preloads configs and disks', async () => {
    const _dispatch = sandbox.stub();

    await EditConfigPage.preload(
      { dispatch: _dispatch, getState: () => state },
      { linodeLabel: 'test-linode-1242' });

    expect(_dispatch.callCount).to.equal(1);

    const disks = _dispatch.firstCall.args[0];

    _dispatch.reset();
    _dispatch.returns({ total_pages: 1, disks: [], total_results: 0 });
    await disks(_dispatch, () => state);
    const fn2 = _dispatch.firstCall.args[0];
    await expectRequest(fn2, '/linode/instances/1242/disks/?page=1', undefined, { disks: [] });
  });

  it('calls saveChanges when save is pressed', async () => {
    const page = mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />);

    const saveChanges = sandbox.stub(page.instance(), 'saveChanges');
    await page.find('Form').props().onSubmit();
    expect(saveChanges.callCount).to.equal(1);
  });

  it('redirects to advanced page after call', async () => {
    const page = shallow(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    await page.instance().saveChanges();
    expect(dispatch.callCount).to.equal(2);
    const arg = dispatch.secondCall.args[0];
    expectObjectDeepEquals(
      arg, push(`/linodes/${props.linode.label}/settings/advanced`));
  });

  it('remove disk slot', async () => {
    const page = await mount(
      <EditConfigPage
        {...props}
        dispatch={dispatch}
      />
    );

    expect(page.find('#config-device-sdb').length).to.equal(1);

    const removeBtn = page.find('.EditConfigPage-remove').at(0);
    expect(removeBtn.text()).to.equal('Remove');
    removeBtn.simulate('click');

    expect(page.find('#config-device-sdb').length).to.equal(0);
  });

  it('add disk slot', async () => {
    const page = await mount(
      <EditConfigPage
        {...props}
        linode={testLinode1233}
        config={testLinode1233._configs.configs[12346]}
        dispatch={dispatch}
      />
    );

    expect(page.find('#config-device-sdb').length).to.equal(0);

    const addBtn = page.find('.EditConfigPage-add').at(0);
    expect(addBtn.text()).to.equal('Add');
    addBtn.simulate('click');

    expect(page.find('#config-device-sdb').length).to.equal(1);
  });

  it('generates a default disk slot on create', async () => {
    const page = await mount(
      <EditConfigPage
        {...props}
        create
        params={{ linodeLabel: 'test-linode-1233' }}
        dispatch={dispatch}
      />
    );

    expect(page.find('#config-device-sda').props().value).to.equal('12345');
  });

  it('uses network helper default on create', async () => {
    const page = await mount(
      <EditConfigPage
        {...props}
        create
        params={{ linodeLabel: 'test-linode-1233' }}
        dispatch={dispatch}
      />
    );

    expect(page.find('#config-enableNetworkHelper').props().checked).to.equal(true);
  });

  describe('UI changes state values', () => {
    afterEach(() => {
      dispatch.reset();
      sandbox.restore();
    });

    it('change label', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const label = page.find('#config-label');
      label.simulate('change', { target: { value: 'changed label' } });
      expect(label.props().value).to.equal('changed label');
    });

    it('change note', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const notes = page.find('#config-comments');
      notes.simulate('change', { target: { value: 'changed note' } });
      expect(notes.props().value).to.equal('changed note');
    });

    it('change kernel', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const kernel = page.find('#config-kernel');
      kernel.simulate('change', { target: { value: 'linode/latest' } });
      expect(kernel.props().value).to.equal('linode/latest');
    });

    it('change network helper', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const networkHelper = page.find('#config-enableNetworkHelper');
      const valueWas = networkHelper.props().checked;
      networkHelper.simulate('change');
      expect(networkHelper.props().checked).to.equal(!valueWas);
    });

    it('change distro helper', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const distroHelper = page.find('#config-enableDistroHelper');
      const valueWas = distroHelper.props().checked;
      distroHelper.simulate('change');
      expect(distroHelper.props().checked).to.equal(!valueWas);
    });

    it('change modules.dep helper', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const moduleDep = page.find('#config-enableModulesdepHelper');
      const valueWas = moduleDep.props().checked;
      moduleDep.simulate('change');
      expect(moduleDep.props().checked).to.equal(!valueWas);
    });

    it('change updatedb helper', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const updatedb = page.find('#config-disableUpdatedb');
      const valueWas = updatedb.props().checked;
      updatedb.simulate('change');
      expect(updatedb.props().checked).to.equal(!valueWas);
    });

    it('change virt mode', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const virtMode = page.find('#config-virtMode-fullvirt');
      virtMode.simulate('change', { target: { value: 'fullvirt' } });
      expect(page.instance().state.virtMode).to.equal('fullvirt');
    });

    it('change run level', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const runLevel = page.find('#config-runLevel-single');
      runLevel.simulate('change', { target: { value: 'single' } });
      expect(page.instance().state.runLevel).to.equal('single');
    });

    it('change memory limit', () => {
      const page = mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const isMaxRam = page.find('#config-isMaxRam-false');
      isMaxRam.simulate('change', { target: { value: false } });

      const ramLimit = page.find('#config-ramLimit');
      ramLimit.simulate('change', { target: { value: 1000 } });

      expect(page.instance().state.isMaxRam).to.equal(false);
      expect(ramLimit.props().value).to.equal(1000);
    });

    it('change /dev/sda', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const disk = page.find('#config-device-sda');
      disk.simulate('change', { target: { value: 12346 } });
      expect(disk.props().value).to.equal('12346');
    });

    it('change initrd', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const initrd = page.find('#config-initrd');
      initrd.simulate('change', { target: { value: '25669' } });
      expect(initrd.props().value).to.equal('25669');
    });

    it('change root device standard select', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const device = page.find('#config-root-device-select');
      device.simulate('change', { target: { value: '/dev/sdb' } });
      expect(device.props().value).to.equal('/dev/sdb');
    });

    it('change root device custom and input', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const device = page.find('#config-custom-root-device');
      page.find('#config-isCustomRoot-true').simulate('change');
      device.simulate('change', { target: { value: '/dev/sda/2' } });
      expect(device.props().value).to.equal('/dev/sda/2');
      expect(page.instance().state.isCustomRoot).to.equal(true);
    });
  });

  describe('edit config', () => {
    it('renders kernel properly', async () => {
      const page = shallow(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      const kernel = page.find('#config-kernel');
      expect(kernel.find('optgroup').length).to.equal(2);
      expect(kernel.find('optgroup').at(0).props()).to.have.property('label')
        .which.equals('Current');
      expect(kernel.find('optgroup').at(1).props()).to.have.property('label')
        .which.equals('Deprecated');
      expect(kernel.find('option').length).to.equal(2);
      expect(kernel.find('option').at('0').text()).to.equal('Latest 64-bit kernel');
      expect(kernel.find('option[value="linode/latest_64"]').length).to.equal(1);
      expect(kernel.find('option').at('1').text()).to.equal('Latest 32-bit kernel');
      expect(kernel.find('option[value="linode/latest"]').length).to.equal(1);
    });

    it('renders disks slots properly', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const sda = page.find('#config-device-sda');
      // the two disks plus one for Finnix equals 3
      expect(sda.find('option').length).to.equal(3);
      expect(sda.find('option').at(0).text()).to.equal('Arch Linux 2015.08 Disk');
      expect(sda.find('option').at(0).props().value).to.equal(12345);
      expect(sda.find('option').at(1).text()).to.equal('Swap Disk');
      expect(sda.find('option').at(1).props().value).to.equal(12346);
    });

    it('renders boot device properly', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );

      const device = page.find('#config-root-device-select');
      expect(device.find('option').length).to.equal(2);
      expect(device.find('option').at('0').text()).to.equal('/dev/sda');
      expect(device.find('option[value="/dev/sda"]').length).to.equal(1);
      expect(device.find('option').at('1').text()).to.equal('/dev/sdb');
      expect(device.find('option[value="/dev/sdb"]').length).to.equal(1);
    });

    it('commits changes to the API', async () => {
      const page = await mount(
        <EditConfigPage
          {...props}
          dispatch={dispatch}
        />
      );
      dispatch.reset();
      const label = page.find('FormGroup');
      label.find('#config-label').simulate('change', { target: { value: 'new label' } });
      const isMaxRam = page.find('#config-isMaxRam-true');
      isMaxRam.simulate('change', { target: { value: true } });
      await page.instance().saveChanges(false);
      expect(dispatch.callCount).to.equal(2);
      const fn = dispatch.firstCall.args[0];

      await expectRequest(fn, `/linode/instances/${testLinode.id}/configs/12345`, {
        method: 'PUT',
        body: {
          label: 'new label',
          comments: 'Test comments',
          ram_limit: 0,
          run_level: 'default',
          virt_mode: 'paravirt',
          kernel: 'linode/latest_64',
          disks: {
            sda: { id: 12345 },
            sdb: { id: 12346 },
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
      });
    });
  });
});
