import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import { ConfigEdit } from '~/linodes/linode/settings/layouts/ConfigEdit';
const { kernels, linodes } = api;


describe('linodes/linode/settings/layouts/ConfigEdit', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const props = {
    linodes,
    kernels,
    dispatch,
    params: {
      linodeId: `${testLinode.id}`,
      configId: '12345',
    },
  };

  describe('universal checks', () => {
    it('renders all fields', () => {
      const page = shallow(
        <ConfigEdit
          {...props}
        />);

      expect(page.find('FormGroup[field="label"]').length).to.equal(1);
      expect(page.find('FormGroup[field="comments"]').length).to.equal(1);
      expect(page.find('input[id="config-virt_mode-paravirt"]').length)
        .to.equal(1);
      expect(page.find('input[id="config-virt_mode-fullvirt"]').length)
        .to.equal(1);
      expect(page.find('select[id="config-kernel"]').length)
        .to.equal(1);
      expect(page.find('input[id="config-run_level-default"]').length)
        .to.equal(1);
      expect(page.find('input[id="config-run_level-single"]').length)
        .to.equal(1);
      expect(page.find('input[id="config-run_level-binbash"]').length)
        .to.equal(1);
      expect(page.find('FormGroup[field="ram_limit"]').length).to.equal(1);
      expect(page.find('select[id="config-device-sda"]').length).to.equal(1);
      expect(page.find('input[id="config-boot_device-standard"]').length).to.equal(1);
      expect(page.find('select[id="config-root-device-select"]').length).to.equal(1);
      expect(page.find('input[id="config-boot_device-custom"]').length).to.equal(1);
      expect(page.find('input[id="config-custom-root-device"]').length).to.equal(1);
    });

    it('renders cancel link', () => {
      const page = shallow(
        <ConfigEdit
          {...props}
        />);
      const btn = page.find('Link');
      expect(btn.length).to.equal(1);
      expect(btn.props().to)
        .to.equal(`/linodes/${testLinode.id}/settings/advanced`);
    });

    it('commits changes to the state as edits are made', () => {
      const page = shallow(
        <ConfigEdit
          {...props}
        />);
      const label = page.find('FormGroup[field="label"]');
      const comments = page.find('FormGroup[field="comments"]');
      const paravirt = page.find('input[id="config-virt_mode-paravirt"]');
      const fullvirt = page.find('input[id="config-virt_mode-fullvirt"]');
      const kernel = page.find('select[id="config-kernel"]');
      const defaultRunLevel = page.find('input[id="config-run_level-default"]');
      const single = page.find('input[id="config-run_level-single"]');
      const binbash = page.find('input[id="config-run_level-binbash"]');
      const memlimit = page.find('FormGroup[field="ram_limit"]');
      label.find('input').simulate('change', { target: { value: 'new label' } });
      expect(page.state('label')).to.equal('new label');
      comments.find('textarea').simulate('change', { target: { value: 'new comments' } });
      expect(page.state('comments')).to.equal('new comments');
      paravirt.simulate('change', { target: { value: 'paravirt' } });
      expect(page.state('virt_mode')).to.equal('paravirt');
      fullvirt.simulate('change', { target: { value: 'fullvirt' } });
      expect(page.state('virt_mode')).to.equal('fullvirt');
      kernel.simulate('change', { target: { value: 'linode/latest' } });
      expect(page.state('kernel')).to.equal('linode/latest');
      defaultRunLevel.simulate('change', { target: { value: 'default' } });
      expect(page.state('run_level')).to.equal('default');
      single.simulate('change', { target: { value: 'single' } });
      expect(page.state('run_level')).to.equal('single');
      binbash.simulate('change', { target: { value: 'binbash' } });
      expect(page.state('run_level')).to.equal('binbash');
      memlimit.find('input').simulate('change', { target: { value: '1000' } });
      expect(page.state('ram_limit')).to.equal('1000');
    });

    it('calls saveChanges when save is pressed', () => {
      const page = shallow(
        <ConfigEdit
          {...props}
        />);
      const saveChanges = sandbox.stub(page.instance(), 'saveChanges');
      page.find('.btn-primary').simulate('click');
      expect(saveChanges.calledOnce).to.equal(true);
    });

    it('handles API errors', async () => {
      const dispatch = sandbox.stub();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />);
      dispatch.throws({
        json: () => ({
          errors: [{ field: 'label', reason: 'because of fail' }],
        }),
      });
      await page.instance().saveChanges();
      expect(page.state('errors'))
        .to.have.property('label')
        .that.deep.equals([{
          field: 'label',
          reason: 'because of fail',
        }]);
    });

    it('redirects to advanced page after call', async () => {
      const dispatch = sandbox.stub();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().saveChanges();
      expect(dispatch.calledTwice).to.equal(true);
      const arg = dispatch.secondCall.args[0];
      expect(arg).to.deep.equal(push(`/linodes/${props.params.linodeId}/settings/advanced`));
    });

    it('config not exist', async () => {
      const dispatch = sandbox.stub();
      const badProps = {
        ...props,
        params: {
          linodeId: `${testLinode.id}`,
          configId: '999999999999999',
        },
      };
      const path = `/linodes/${testLinode.id}/settings/advanced`;

      const page = shallow(
        <ConfigEdit
          {...badProps}
          dispatch={dispatch}
        />);

      await page.instance().componentDidMount();
      expect(dispatch.calledWith(push(path))).to.equal(true);
    });

    it('add disk', async () => {
      const dispatch = sandbox.spy();
      const page = mount(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      const addBtn = page.find('.add-disk-btn').last();
      const diskCount = page.find('disks').length;
      await addBtn.simulate('click');
      expect(page.find('disks').length).to.equal(diskCount + 1);
    });

    it('delete disk', async () => {
      const dispatch = sandbox.spy();
      const page = mount(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      const addBtn = page.find('.delete-disk-btn').last();
      const diskCount = page.find('disks').length;
      await addBtn.simulate('click');
      expect(page.find('disks').length).to.equal(diskCount - 1);
    });

    describe('UI changes state values', () => {
      it('change label', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const label = page.find('FormGroup[field="label"]');
        await label.find('input').simulate('change', { target: { value: 'changed label' } });
        expect(page.instance().state.label).to.equal('changed label');
      });

      it('change note', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const notes = page.find('FormGroup[field="comments"]');
        await notes.find('textarea').simulate('change', { target: { value: 'changed note' } });
        expect(page.instance().state.comments).to.equal('changed note');
      });

      it('change kernel', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const kernel = page.find('select[id="config-kernel"]');
        await kernel.simulate('change', { target: { value: 'linode/latest' } });
        expect(page.instance().state.kernel).to.equal('linode/latest');
      });

      describe('helpers', () => {
        it('change distro helper', async () => {
          const dispatch = sandbox.spy();
          const page = mount(
            <ConfigEdit
              {...props}
              dispatch={dispatch}
            />
          );

          await page.instance().componentDidMount();
          const valueWas = page.instance().state.helpers.enable_network_helper;
          const networkHelper = page.find('.enable_network_helper-checkbox');
          await networkHelper.simulate('change', { target: { checked: !valueWas } });
          expect(page.instance().state.helpers.enable_network_helper)
            .to.equal(!valueWas);
        });

        it('change network helper', async () => {
          const dispatch = sandbox.spy();
          const page = mount(
            <ConfigEdit
              {...props}
              dispatch={dispatch}
            />
          );

          await page.instance().componentDidMount();
          const valueWas = page.instance().state.helpers.enable_distro_helper;
          const distroHelper = page.find('.enable_distro_helper-checkbox');
          await distroHelper.simulate('change', { target: { checked: !valueWas } });
          expect(page.instance().state.helpers.enable_distro_helper)
            .to.equal(!valueWas);
        });

        it('change modules.dep helper', async () => {
          const dispatch = sandbox.spy();
          const page = mount(
            <ConfigEdit
              {...props}
              dispatch={dispatch}
            />
          );

          await page.instance().componentDidMount();
          const valueWas = page.instance().state.helpers.enable_modules_dep_helper;
          const moduleDep = page.find('.enable_modules_dep_helper-checkbox');
          await moduleDep.simulate('change', { target: { checked: !valueWas } });
          expect(page.instance().state.helpers.enable_modules_dep_helper)
            .to.equal(!valueWas);
        });

        it('change updatedb helper', async () => {
          const dispatch = sandbox.spy();
          const page = mount(
            <ConfigEdit
              {...props}
              dispatch={dispatch}
            />
          );

          await page.instance().componentDidMount();
          const valueWas = page.instance().state.helpers.disable_updatedb;
          const updatedb = page.find('.disable_updatedb-checkbox');
          await updatedb.simulate('change', { target: { checked: !valueWas } });
          expect(page.instance().state.helpers.disable_updatedb)
            .to.equal(!valueWas);
        });
      });
      it('change virt mode', async () => {
        const dispatch = sandbox.spy();
        const page = mount(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        const updatedb = page.find('#config-virt_mode-fullvirt');
        await updatedb.simulate('change', { target: { value: 'fullvirt' } });
        expect(page.instance().state.virt_mode)
          .to.equal('fullvirt');
      });

      it('change run level', async () => {
        const dispatch = sandbox.spy();
        const page = mount(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        const updatedb = page.find('#config-run_level-single');
        await updatedb.simulate('change', { target: { value: 'single' } });
        expect(page.instance().state.run_level)
          .to.equal('single');
      });

      it('change memory limit', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const ramLimit = page.find('FormGroup[field="ram_limit"]');
        await ramLimit.find('input').simulate('change', { target: { value: 1000 } });
        expect(page.instance().state.ram_limit).to.equal(1000);
      });

      it('change /dev/sda', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const disk = page.find('select[id="config-device-sda"]');
        await disk.simulate('change', { target: { value: 12346 } });
        expect(page.instance().state.disks.sda.id).to.equal(12346);
      });

      it('change root device standard select', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const device = page.find('select[id="config-root-device-select"]');
        await device.simulate('change', { target: { value: '/dev/sdb' } });
        expect(page.instance().state.root_device).to.equal('/dev/sdb');
      });

      it('change root device custom and input', async () => {
        const dispatch = sandbox.spy();
        const page = shallow(
          <ConfigEdit
            {...props}
            dispatch={dispatch}
          />
        );

        await page.instance().componentDidMount();
        dispatch.reset();
        const device = page.find('input[id="config-custom-root-device"]');
        await device.simulate('change', { target: { value: '/dev/sda/2' } });
        const radio = page.find('#config-boot_device-custom');
        await radio.simulate('change', { target: { value: 'custom' } });
        expect(page.instance().state.root_device_custom).to.equal('/dev/sda/2');
        expect(page.instance().state.boot_device).to.equal('custom');
      });
    });
  });

  describe('add config', () => {
    const createProps = {
      ...props,
      params: {
        linodeId: `${testLinode.id}`,
        configId: 'create',
      },
    };

    it('create new config', async () => {
      const page = shallow(
        <ConfigEdit
          {...createProps}
        />);

      expect(page.find('h2').at(0).text()).to.equal('Add config<HelpButton />');
      expect(page.find('.btn-primary').at(0).text()).to.equal('Add config');
    });

    it('create config state loads properly', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...createProps}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      dispatch.reset();
      expect(page.instance().state.loading).to.equal(false);
      expect(page.instance().state.virt_mode).to.equal('paravirt');
      expect(page.instance().state.run_level).to.equal('default');
      expect(page.instance().state.comments).to.equal('');
      expect(page.instance().state.label).to.equal('');
      expect(page.instance().state.ram_limit).to.equal(2048);
      expect(page.instance().state.kernel).to.equal('linode/latest');
      expect(page.instance().state.root_device).to.equal('/dev/sda');
      expect(page.instance().state.root_device_custom).to.equal('');
      expect(page.instance().state.boot_device).to.equal('standard');
      expect(page.instance().state.disks.sda.id).to.equal('none');
      expect(page.instance().state.disks.sdb).to.equal(null);
      expect(page.instance().state.disks.sdc).to.equal(null);
      expect(page.instance().state.disks.sdd).to.equal(null);
      expect(page.instance().state.disks.sde).to.equal(null);
      expect(page.instance().state.disks.sdf).to.equal(null);
      expect(page.instance().state.disks.sdg).to.equal(null);
      expect(page.instance().state.disks.sdh).to.equal(null);
      expect(page.instance().state.helpers.disable_updatedb).to.equal(true);
      expect(page.instance().state.helpers.enable_distro_helper).to.equal(true);
      expect(page.instance().state.helpers.enable_modules_dep_helper).to.equal(true);
      expect(page.instance().state.helpers.enable_network_helper).to.equal(true);
    });
  });

  describe('edit config', () => {
    it('edit existing config', async () => {
      const page = shallow(
        <ConfigEdit
          {...props}
        />);
      expect(page.find('h2').at(0).text()).to.equal('Edit config<HelpButton />');
    });

    it('existing config state loads properly', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      dispatch.reset();
      expect(page.instance().state.loading).to.equal(false);
      expect(page.instance().state.virt_mode).to.equal('paravirt');
      expect(page.instance().state.run_level).to.equal('default');
      expect(page.instance().state.comments).to.equal('Test comments');
      expect(page.instance().state.label).to.equal('Test config');
      expect(page.instance().state.ram_limit).to.equal(1024);
      expect(page.instance().state.kernel).to.equal('linode/latest_64');
      expect(page.instance().state.root_device).to.equal('/dev/sda');
      expect(page.instance().state.root_device_custom).to.equal('');
      expect(page.instance().state.boot_device).to.equal('standard');
      expect(page.instance().state.disks.sda.id).to.equal(12345);
      expect(page.instance().state.disks.sdb.id).to.equal(12346);
      expect(page.instance().state.disks.sdc).to.equal(null);
      expect(page.instance().state.disks.sdd).to.equal(null);
      expect(page.instance().state.disks.sde).to.equal(null);
      expect(page.instance().state.disks.sdf).to.equal(null);
      expect(page.instance().state.disks.sdg).to.equal(null);
      expect(page.instance().state.disks.sdh).to.equal(null);
      expect(page.instance().state.helpers.disable_updatedb).to.equal(true);
      expect(page.instance().state.helpers.enable_distro_helper).to.equal(true);
      expect(page.instance().state.helpers.enable_modules_dep_helper).to.equal(true);
      expect(page.instance().state.helpers.enable_network_helper).to.equal(true);
      expect(page.instance().state.id).to.equal(12345);
      expect(page.instance().state.root_device_ro).to.equal(false);
      expect(page.instance().state.devtmpfs_automount).to.equal(false);
    });

    it('renders kernel properly', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      dispatch.reset();
      const kernel = page.find('select[id="config-kernel"]');
      expect(kernel.find('option').length).to.equal(2);
      expect(kernel.find('option').at('0').text()).to.equal('Latest 64-bit kernel');
      expect(kernel.find('option[value="linode/latest_64"]').length).to.equal(1);
      expect(kernel.find('option').at('1').text()).to.equal('Latest 32-bit kernel');
      expect(kernel.find('option[value="linode/latest"]').length).to.equal(1);
    });

    it('renders disks slots properly', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      dispatch.reset();
      const sda = page.find('select[id="config-device-sda"]');
      expect(sda.find('option').length).to.equal(3);
      expect(sda.find('option').at('0').text()).to.equal('None');
      expect(sda.find('option[value="none"]').length).to.equal(1);
      expect(sda.find('option').at('1').text()).to.equal('Arch Linux 2015.08 Disk');
      expect(sda.find('option[value="12345"]').length).to.equal(1);
      expect(sda.find('option').at('2').text()).to.equal('Swap Disk');
      expect(sda.find('option[value="12346"]').length).to.equal(1);
    });

    it('renders boot device properly', async () => {
      const dispatch = sandbox.spy();
      const page = mount(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );

      await page.instance().componentDidMount();
      await dispatch.reset();
      const device = page.find('select[id="config-root-device-select"]');
      expect(device.find('option').length).to.equal(2);
      expect(device.find('option').at('0').text()).to.equal('/dev/sda');
      expect(device.find('option[value="/dev/sda"]').length).to.equal(1);
      expect(device.find('option').at('1').text()).to.equal('/dev/sdb');
      expect(device.find('option[value="/dev/sdb"]').length).to.equal(1);
    });

    it('commits changes to the API', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />
      );
      await page.instance().componentDidMount();
      dispatch.reset();
      const label = page.find('FormGroup[field="label"]');
      label.find('input').simulate('change', { target: { value: 'new label' } });
      await page.instance().saveChanges(false);
      expect(dispatch.calledTwice).to.equal(true);
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, `/linode/instances/${testLinode.id}/configs/12345`,
        () => {}, null, options => {
          expect(options.method).to.equal('PUT');
          expect(JSON.parse(options.body)).to.deep.equal({
            label: 'new label',
            comments: 'Test comments',
            ram_limit: 1024,
            run_level: 'default',
            virt_mode: 'paravirt',
            kernel: 'linode/latest_64',
            disks: {
              sda: { id: 12345 },
              sdb: { id: 12346 },
              sdc: null,
              sdd: null,
              sde: null,
              sdf: null,
              sdg: null,
              sdh: null,
            },
            root_device: '/dev/sda',
            helpers: {
              disable_updatedb: true,
              enable_distro_helper: true,
              enable_network_helper: true,
              enable_modules_dep_helper: true,
            },
          });
        });
    });
  });
});
