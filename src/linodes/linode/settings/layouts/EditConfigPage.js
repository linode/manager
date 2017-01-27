import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import HelpButton from '~/components/HelpButton';
import { FormGroup } from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';
import { SubmitButton, CancelButton } from '~/components/form';
import { LinkButton } from '~/components/buttons';
import { setSource } from '~/actions/source';
import { setError } from '~/actions/errors';

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
  Object.values(disks).forEach(diskOrId => {
    if (diskOrId) {
      diskSlots.push(fromConfig ? diskOrId : diskOrId.id);
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

export function renderDiskSlot(device, index) {
  const { diskSlots, loading } = this.state;
  const disks = this.getDisks();

  const oneDiskSlotInUse = index === 0 && diskSlots.length === 1;
  const currentDisk = index === diskSlots.length - 1;
  const allDisksInUse = index === Math.max(diskSlots.length, Object.keys(disks).length) - 1;

  const addButton = oneDiskSlotInUse || currentDisk && !allDisksInUse ? (
    <LinkButton
      className="EditConfigPage-add"
      disabled={loading}
      onClick={() => this.addDiskSlot()}
    >Add</LinkButton>
  ) : null;

  const deleteButton = index > 0 && index === diskSlots.length - 1 ? (
    <LinkButton
      className="EditConfigPage-remove"
      disabled={loading}
      onClick={() => this.removeDiskSlot(device)}
    >Remove</LinkButton>
  ) : null;

  return (
    <div
      className="form-group row disk-slot"
      key={index}
    >
      <label className="col-sm-2 label-col">
        /dev/{AVAILABLE_DISK_SLOTS[index]}:
      </label>
      <div className="col-xs-9 input-container">
        <select
          className="form-control"
          id={`config-device-${AVAILABLE_DISK_SLOTS[index]}`}
          value={device}
          disabled={loading}
          onChange={e => {
            diskSlots[index] = parseInt(e.target.value, 10);
            this.setState({ diskSlots });
            this.fillDiskSlots(index, device);
          }}
        >
          {Object.keys(disks).map((disk, i) => {
            if (disks[disk]) {
              const { id, label } = disks[disk];
              return (
                <option key={i} value={id}>
                  {label}
                </option>
              );
            }
          })}
          <option value="25665">
            Recovery - Finnix (iso)
          </option>
        </select>
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

  renderFormElement(label, field, element) {
    const { errors } = this.state;
    return (
      <FormGroup errors={errors} name={field} className="row">
        <div className="col-sm-2 label-col">
          <label
            htmlFor={`config-${field}`}
          >{label}</label>
        </div>
        <div className="col-sm-6">{element}</div>
      </FormGroup>
    );
  }

  renderRadio(label, field, value) {
    return (
      <div className="checkbox">
        <label>
          <input
            type="radio"
            name={`config-${field}`}
            id={`config-${field}-${value}`}
            disabled={this.state.loading}
            checked={this.state[field] === value}
            onChange={() => this.setState({ [field]: value })}
          /> {label}
        </label>
      </div>
    );
  }

  renderCheckbox(label, field, hint) {
    const hinter = hint ? (<small className="text-muted">{hint}</small>) : null;
    return (
      <div className="checkbox form-group">
        <label>
          <input
            type="checkbox"
            name={`config-${field}`}
            id={`config-${field}`}
            disabled={this.state.loading}
            checked={this.state.helpers[field]}
            onChange={() => this.setState({
              helpers: { ...this.state.helpers, [field]: !this.state.helpers[field] },
            })}
          /> {label}
          <div>{hinter}</div>
        </label>
      </div>
    );
  }

  render() {
    const { create, kernels, params: { linodeLabel } } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, ramLimit, rootDevice,
      initrd, errors, diskSlots } = this.state;
    const linode = this.getLinode();

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
          {this.renderFormElement('Label', 'label', (
            <input
              className="form-control"
              id="config-label"
              disabled={loading}
              placeholder={'My new config'}
              value={label}
              onChange={e => this.setState({ label: e.target.value })}
            />
           ))}
          {this.renderFormElement('Notes', 'comments', (
            <textarea
              className="form-control"
              id="config-comments"
              placeholder="Notes"
              value={comments}
              disabled={loading}
              onChange={e => this.setState({ comments: e.target.value })}
            />
           ))}
        </div>
        <h3 className="sub-header">Virtual Machine Mode</h3>
        <div>
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>Virtualization mode</legend>
            </div>
            <div className="col-sm-6">
              {this.renderRadio('Paravirtualization', 'virtMode', 'paravirt')}
              {this.renderRadio('Full virtualization', 'virtMode', 'fullvirt')}
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
                disabled={loading}
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
            <div className="col-sm-6">
              {this.renderRadio('Default', 'runLevel', 'default')}
              {this.renderRadio('Single-user mode', 'runLevel', 'single')}
              {this.renderRadio('init=/bin/bash', 'runLevel', 'binbash')}
            </div>
          </fieldset>
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <label>Memory limit</label>
            </div>
            <div className="input-container col-sm-6">
              {this.renderRadio(
                <span>
                  <input
                    className="form-control"
                    id="config-ramLimit"
                    disabled={loading}
                    placeholder="Memory limit"
                    type="number"
                    value={ramLimit}
                    onChange={e => this.setState({ ramLimit: e.target.value })}
                  />
                  <span className="measure-unit">MB</span>
                </span>,
                'isMaxRam',
                false
              )}
              {this.renderRadio(
                <span>Maximum ({
                  linode.type.length ? linode.type[0].ram : null
                } MB)</span>,
                'isMaxRam',
                true
              )}
            </div>
          </div>
          {diskSlots.map(this.renderDiskSlot)}
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>initrd</legend>
            </div>
            <div className="input-container col-sm-6">
              <select
                id="config-initrd"
                disabled={loading}
                value={initrd}
                className="form-control"
                onChange={e => this.setState({ initrd: e.target.value })}
              >
                <option value="">No initrd</option>
                <option value="25669">Recovery - Finnix (initrd)</option>
              </select>
            </div>
          </div>
          <div className="form-group row">
            <div className="col-sm-2 label-col">
              <label>root / boot device</label>
            </div>
            <div className="input-container col-sm-6">
              {this.renderRadio(
                <span className="multi-radio clearfix">
                  <span>
                    Standard
                  </span>
                  <select
                    id="config-root-device-select"
                    className="form-control float-xs-right"
                    value={isCustomRoot ? '/dev/sda' : rootDevice}
                    disabled={loading || isCustomRoot}
                    onChange={e => this.setState({ rootDevice: e.target.value })}
                  >
                    {diskSlots.map((_, i) =>
                      <option key={i} value={`/dev/${AVAILABLE_DISK_SLOTS[i]}`}>
                        /dev/{AVAILABLE_DISK_SLOTS[i]}
                      </option>
                     )}
                  </select>
                </span>, 'isCustomRoot', false)}
              {this.renderRadio(
                <span className="multi-radio clearfix">
                  <span>
                    Custom
                  </span>
                  <input
                    type="text"
                    className="form-control float-xs-right"
                    id="config-custom-root-device"
                    disabled={loading || !isCustomRoot}
                    placeholder="/dev/xvda"
                    value={isCustomRoot ? rootDevice : ''}
                    onChange={e => this.setState({ rootDevice: e.target.value })}
                  />
                </span>, 'isCustomRoot', true)}
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
            <div className="col-md-8">
              {this.renderCheckbox(
                'Enable distro helper',
                'enableDistroHelper',
                'Helps maintain correct inittab/upstart console device')}
              {this.renderCheckbox(
                'Disable updatedb',
                'disableUpdatedb',
                'Disables updatedb cron job to avoid disk thrashing')}
              {this.renderCheckbox(
                'Enable modules.dep helper',
                'enableModulesdepHelper',
                'Creates a modules dependency file for the kernel you run')}
              {this.renderCheckbox(
                'Enable network helper',
                'enableNetworkHelper',
                <span>
                  Automatically configure static networking <a
                    href="https://www.linode.com/docs/platform/network-helper"
                  >
                    (more info)
                  </a>
                </span>)}
            </div>
          </fieldset>
          <ErrorSummary errors={errors} />
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton
                disabled={loading}
                onClick={() => this.saveChanges()} // Look this up onClick for testing purposes
              >{this.props.create ? 'Add config' : 'Save'}</SubmitButton>
              <CancelButton to={`/linodes/${linodeLabel}/settings/advanced`} />
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
