import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import HelpButton from '~/components/HelpButton';
import { FormGroup, FormGroupError } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { Link } from '~/components/Link';
import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';
import Input from '~/components/Input';
import Radio from '~/components/Radio';
import Checkbox from '~/components/Checkbox';
import Select from '~/components/Select';
import RadioSelectCombo from '~/components/RadioSelectCombo';
import RadioInputCombo from '~/components/RadioInputCombo';

const CLASSNAME="LinodesLinodeSettingsEditConfigPage";

export const AVAILABLE_DISK_SLOTS =
  ['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg', 'sdh'];

export function getConfig() {
  const linode = this.getLinode();
  const configId = parseInt(this.props.params.configId);
  return linode._configs.configs[configId];
}

export function getDisks() {
  const linode = this.getLinode();
  return linode._disks.totalResults === -1 ? null : linode._disks.disks;
}

export function getDiskSlots(fromConfig = false) {
  const disks = fromConfig ? this.getConfig().disks : this.getDisks();
  const diskSlots = [];
  Object.values(disks).forEach(disk => {
    if (disk) {
      diskSlots.push(disk.id);
    }
  });
  return diskSlots;
}

export function fillDiskSlots(slotToKeep, slotToKeepOldValue) {
  const { diskSlots } = this.state;
  const newSlotValue = diskSlots[slotToKeep];

  diskSlots.forEach((slot, i) => {
    if (i === slotToKeep) {
      return;
    }

    if (newSlotValue === slot) {
      diskSlots[i] = slotToKeepOldValue;
    }
  });

  this.setState({ diskSlots });
}

export function addDiskSlot() {
  const { diskSlots } = this.state;
  const allDiskSlots = this.getDiskSlots();

  for (const diskSlot of allDiskSlots) {
    if (diskSlots.indexOf(diskSlot) === -1) {
      diskSlots.push(diskSlot);
      break;
    }
  }

  this.setState({ diskSlots });
}

export function removeDiskSlot() {
  const { diskSlots } = this.state;
  diskSlots.pop();
  this.setState({ diskSlots });
}

export function renderDiskSlot(device, index, disabled) {
  const { diskSlots, loading } = this.state;
  const disks = this.getDisks();

  const oneDiskSlotInUse = index === 0 && diskSlots.length === 1;
  const currentDisk = index === diskSlots.length - 1;
  const allDisksInUse = index === Math.max(diskSlots.length, Object.keys(disks).length) - 1;

  const addButton = oneDiskSlotInUse || currentDisk && !allDisksInUse ? (
    <button
      type="button"
      className="btn btn-cancel"
      onClick={() => this.addDiskSlot()}
    >Add</button>
  ) : null;

  const deleteButton = index > 0 && index === diskSlots.length - 1 ? (
    <button
      type="button"
      className="btn btn-cancel"
      onClick={() => this.removeDiskSlot(device)}
    >Remove</button>
  ) : null;

  return (
    <div className="form-group row" key={index}>
      <div className="col-sm-2 label-col">
        <label>
          /dev/{AVAILABLE_DISK_SLOTS[index]}:
        </label>
      </div>
      <div className="col-sm-10 content-col">
        <Select
          value={device}
          disabled={disabled}
          onChange={e => {
            diskSlots[index] = parseInt(e.target.value, 10);
            this.setState({ diskSlots });
            this.fillDiskSlots(index, device);
            }}
          options={[...(Object.values(disks).reduce((accum, d) =>
            d ? [...accum, { label: d.label, value: d.id }] : accum, [])),
                    { value: "25665", label: "Recovery - Finnix (iso)" }]}
        />
        <div>
          {addButton}
          {deleteButton}
        </div>
      </div>
    </div>
  );
}

export class EditConfigPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    const { id } = Object.values(getState().api.linodes.linodes).reduce(
      (match, linode) => linode.label === linodeLabel ? linode : match);

    try {
      await dispatch(linodes.configs.all([id]));
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderDiskSlot = renderDiskSlot.bind(this);
    this.getConfig = getConfig.bind(this);
    this.getDisks = getDisks.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.getDiskSlots = getDiskSlots.bind(this);
    this.fillDiskSlots = fillDiskSlots.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.removeDiskSlot = removeDiskSlot.bind(this);

    this.state = {
      loading: true,
      errors: {},
      virtMode: 'paravirt',
      runLevel: 'default',
      comments: '',
      label: '',
      ramLimit: 0, // TODO: fetch from plan
      isMaxRam: true,
      kernel: 'linode/latest_64',
      isCustomRoot: false,
      rootDevice: '/dev/sda',
      diskSlots: [],
      initrd: '',
      helpers: {
        disableUpdatedb: true,
        enableDistroHelper: true,
        enableNetworkHelper: true,
        enableModulesdepHelper: true,
      },
    };
  }

  componentDidMount() {
    const { create, dispatch } = this.props;
    dispatch(setSource(__filename));

    if (create) {
      const disks = this.getDisks();
      if (disks) {
        const diskSlots = Object.values(disks).map(disk => disk.id).slice(0, 1) || [];
        this.setState({ diskSlots, loading: false });
      }
      return;
    }

    // If not creating a new config, populate the state with the config values.
    const config = this.getConfig();

    // Config not found. Should we 404?
    if (!config) {
      dispatch(push(`/linodes/${this.getLinode().id}/settings/advanced`));
      return;
    }

    const diskSlots = this.getDiskSlots(true);

    let isCustomRoot = true;
    let isMaxRam = true;
    let initrd = '';
    try {
      isCustomRoot = AVAILABLE_DISK_SLOTS.indexOf(config.root_device.replace('/dev/', '')) === -1;
      isMaxRam = config.ram_limit === 0;
      initrd = config.initrd;
    } catch (e) {
      // do nothing.
    }

    this.setState({
      diskSlots,
      isCustomRoot,
      isMaxRam,
      initrd,
      loading: false,
      virtMode: config.virt_mode,
      runLevel: config.run_level,
      comments: config.comments,
      label: config.label,
      ramLimit: config.ram_limit,
      kernel: config.kernel.id,
      rootDevice: config.root_device,
      helpers: {
        disableUpdatedb: config.helpers.disable_updatedb,
        enableDistroHelper: config.helpers.enable_distro_helper,
        enableNetworkHelper: config.helpers.enable_network_helper,
        enableModulesdepHelper: config.helpers.enable_modules_dep_helper,
      },
    });
  }

  async saveChanges() {
    const { dispatch } = this.props;
    const linode = this.getLinode();
    const { label, comments, isMaxRam, ramLimit, runLevel, virtMode, kernel,
            diskSlots, initrd, rootDevice, helpers } = this.state;

    this.setState({ loading: true, errors: {} });

    const data = {
      label,
      comments,
      kernel,
      initrd,
      ram_limit: isMaxRam ? 0 : parseInt(ramLimit, 10),
      run_level: runLevel,
      virt_mode: virtMode,
      disks: {},
      root_device: rootDevice,
      helpers: {
        disable_updatedb: helpers.disableUpdatedb,
        enable_distro_helper: helpers.enableDistroHelper,
        enable_network_helper: helpers.enableNetworkHelper,
        enable_modules_dep_helper: helpers.enableModulesdepHelper,
      },
    };

    diskSlots.forEach((id, i) => {
      data.disks[AVAILABLE_DISK_SLOTS[i]] = id;
    });

    try {
      if (this.props.create) {
        await dispatch(linodes.configs.post(data, linode.id));
      } else {
        const configId = this.getConfig().id;
        diskSlots.forEach((id, i) => {
          data.disks[AVAILABLE_DISK_SLOTS[i]] = { id };
        });
        await dispatch(linodes.configs.put(data, linode.id, configId));
      }

      this.setState({ loading: false });
      dispatch(push(`/linodes/${linode.label}/settings/advanced`));
    } catch (response) {
      // Promisify the setState call so we can await it in tests.
      await new Promise(async (resolve) => this.setState({
        loading: false,
        errors: await reduceErrors(response),
      }, resolve));
    }
  }

  render() {
    const { create, kernels, params: { linodeLabel } } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, ramLimit, rootDevice,
      initrd, errors, diskSlots, virtMode, runLevel } = this.state;
    const {
      enableDistroHelper, enableNetworkHelper, enableModulesdepHelper, disableUpdatedb,
    } = this.state.helpers;


    return (
      <section className="card">
        <header>
          <h2>
            {create ? 'Add config' : 'Edit config'}
            <HelpButton to="https://example.org" />
          </h2>
          <h3 className="sub-header">Label and Note</h3>
        </header>
        <div>
          <FormGroup errors={errors} field="label" className="row">
            <div className="col-sm-2 label-col">
              <label>Label</label>
            </div>
            <div className="col-sm-10 content-col">
              <Input
                className={`${CLASSNAME}-label`}
                placeholder="My new config"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} field="label" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} field="comments" className="row">
            <div className="col-sm-2 label-col">
              <label>Notes</label>
            </div>
            <div className="col-sm-10 content-col">
              <textarea
                className={`${CLASSNAME}-notes form-control`}
                placeholder="My notes"
                value={comments}
                onChange={e => this.setState({ comments: e.target.value })}
              />
              <FormGroupError errors={errors} field="comments" />
            </div>
          </FormGroup>
        </div>
        <h3 className="sub-header">Virtual Machine Mode</h3>
        <div>
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>Virtualization mode</legend>
            </div>
            <div className="col-sm-10">
              <Radio
                checked={virtMode === 'paravirt'}
                onChange={() => thi.setState({ virtMode: 'paravirt' })}
                label="Paravirtualization"
              />
              <Radio
                checked={virtMode === 'fullVirt'}
                onChange={() => this.setState({ virtMode: 'fullvirt' })}
                label="Full virtualization"
              />
            </div>
          </fieldset>
        </div>
        <h3 className="sub-header">Block Device Assignment</h3>
        <div>
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <label
                htmlFor="config-kernel"
              >Kernel</label>
            </div>
            <div className="col-sm-6">
              <select
                className="form-control"
                id="config-kernel"
                value={kernel}
                onChange={e => this.setState({ kernel: e.target.value })}
              >
                <optgroup label="Current">
                  {Object.values(kernels.kernels).map(kernel => {
                    const map = {
                      'linode/latest': 'Latest 32-bit kernel',
                      'linode/latest_64': 'Latest 64-bit kernel',
                    };
                    if (kernel.deprecated) return;
                    return (
                      <option key={kernel.id} value={kernel.id}>
                        {map[kernel.id] || kernel.label}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="Deprecated">
                  {Object.values(kernels.kernels).map(kernel => {
                    const map = {
                      'linode/latest': 'Latest 32-bit kernel',
                      'linode/latest_64': 'Latest 64-bit kernel',
                    };
                    if (!kernel.deprecated) return;
                    return (
                      <option key={kernel.id} value={kernel.id}>
                        {map[kernel.id] || kernel.label}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>
          </div>
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>
                Run level
              </legend>
            </div>
            <div className="col-sm-10">
              <Radio
                checked={runLevel === 'default'}
                onChange={() => this.setState({ runLevel: 'default' })}
                label="Default"
              />
              <Radio
                checked={runLevel === 'single'}
                onChange={() => this.setState({ runLevel: 'single' })}
                label="Single"
              />
              <Radio
                checked={runLevel === 'binbash'}
                onChange={() => this.setState({ runLevel: 'binbash' })}
                label="init=/bin/bash"
              />
            </div>
          </fieldset>
          <FormGroup errors={errors} field="ram_limit" className="row">
            <div className="col-sm-2 label-col">
              <label>Memory limit</label>
            </div>
            <div className="col-sm-10 content-col">
              <Input
                className={`${CLASSNAME}-ramLimit`}
                placeholder="Memory limit"
                type="number"
                value={ramLimit}
                onChange={e => this.setState({ ramLimit: e.target.value })}
                label="MB"
              />
              <FormGroupError errors={errors} field="ram_limit" />
            </div>
          </FormGroup>
          {diskSlots.map(this.renderDiskSlot)}
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>initrd</legend>
            </div>
            <div className="col-sm-10">
              <Select
                id="config-initrd"
                value={initrd}
                className="form-control"
                onChange={e => this.setState({ initrd: e.target.value })}
                options={[{ value: '', label: 'No initrd' },
                          { value: '25669', label: 'Recovery - Finnix (initrd)'}]}
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <label>root / boot device</label>
            </div>
            <div className="col-sm-6">
              <RadioSelectCombo
                radioLabel="Standard"
                radioChecked={!isCustomRoot}
                radioOnChange={() => this.setState({ isCustomRoot: false })}
                selectDisabled={isCustomRoot}
                selectValue={isCustomRoot ? '/dev/sda' : rootDevice}
                selectOptions={diskSlots.map((_, i) => ({
                    value: `/dev/${AVAILABLE_DISK_SLOTS[i]}`,
                    label: `/dev/${AVAILABLE_DISK_SLOTS[i]}`
                  }))}
                selectOnChange={e => this.setState({ rootDevice: e.target.value })}
              />
              <RadioInputCombo
                radioLabel="Custom"
                radioChecked={isCustomRoot}
                radioOnChange={() => this.setState({ isCustomRoot: true })}
                inputDisabled={!isCustomRoot}
                inputValue={isCustomRoot ? rootDevice : ''}
                inputOnChange={e => this.setState({ rootDevice: e.target.value })}
              />
            </div>
          </div>
        </div>
        <h3 className="sub-header">Filesystem/Boot Helpers</h3>
        <div>
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>
                Boot helpers
              </legend>
            </div>
            <div className="col-md-10">
              <div className="form-group">
                <Checkbox
                  checked={enableDistroHelper}
                  onChange={() => this.setState({ enableDistroHelper: !enableDistroHelper })}
                  label="Enable distro helper"
                />
                <div>
                  <small className="text-muted">Helps maintain correct inittab/upstart console device</small>
                </div>
              </div>
              <div className="form-group">
                <Checkbox
                  checked={disableUpdatedb}
                  onChange={() => this.setState({ disableUpdatedb: !disableUpdatedb })}
                  label="Disable updatedb"
                />
                <div>
                  <small className="text-muted">Disables updatedb cron job to avoid disk thrashing</small>
                </div>
              </div>
              <div className="form-group">
                <Checkbox
                  checked={enableModulesdepHelper}
                  onChange={() => this.setState({ enableModulesdepHelper: !enableModulesdepHelper })}
                  label="Enable modulesdep helper"
                />
                <div>
                  <small className="text-muted">Creates a module dependency file for the kernel you run</small>
                </div>
              </div>
              <div className="form-group">
                <Checkbox
                  checked={enableNetworkHelper}
                  onChange={() => this.setState({ enableNetworkHelper: !enableNetworkHelper })}
                  label="Enable network helper"
                />
                <div>
                  <small className="text-muted">
                    Automatically configure static networking
                    <a href="https://www.linode.com/docs/platform/network-helper">(more info)</a>
                  </small>
                </div>
              </div>
            </div>
          </fieldset>
          <ErrorSummary errors={errors} />
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <button
                className="btn btn-default"
                disabled={loading}
                onClick={() => this.saveChanges()} // Look this up onClick for testing purposes
              >{this.props.create ? 'Add config' : 'Save'}</button>
              <Link
                className="btn btn-cancel"
                to={`/linodes/${linodeLabel}/settings/advanced`}
              >Cancel</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

EditConfigPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  kernels: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeLabel: PropTypes.string,
    configId: PropTypes.string,
  }),
  create: PropTypes.bool.isRequired,
};

EditConfigPage.defaultProps = {
  create: false,
};

export function select(state) {
  return {
    linodes: state.api.linodes,
    kernels: state.api.kernels,
  };
}

export default connect(select)(EditConfigPage);
