import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes, kernels } from '~/api';
import HelpButton from '~/components/HelpButton';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';
import { Link } from '~/components/Link';
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
  console.log('from edit config page');
  console.log('linode', linode);
  console.log('getLinode', getLinode);
  console.log('this.getLinode', this.getLinode);
  console.log('this.getLinode()', this.getLinode());
  console.log('end logging from edit config page');
  if (linode) {
    return linode._disks.totalResults === -1 ? null : linode._disks.disks;
  }
  return;
}

export async function getDiskSlots(fromConfig = false) {
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

export async function addDiskSlot() {
  const { diskSlots } = this.state;
  const allDiskSlots = await this.getDiskSlots();

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
    <button
      type="button"
      className="btn btn-cancel"
      disabled={loading}
      onClick={() => this.addDiskSlot()}
    >Add slot</button>
  ) : null;

  const deleteButton = index > 0 && index === diskSlots.length - 1 ? (
    <button
      type="button"
      className="btn btn-cancel"
      disabled={loading}
      onClick={() => this.removeDiskSlot(device)}
    >Remove slot</button>
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
        </select>
        <div>
          {addButton}
          {deleteButton}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/sort-comp
export async function loadDisks() {
  const { dispatch } = this.props;
  if (this.getDisks()) return;

  const { linodeId } = this.props.params;
  try {
    await dispatch(linodes.disks.all(linodeId));
  } catch (e) {
    // TODO: handle errors
    // eslint-disable-next-line no-console
    console.error(e);
  }
}

export class EditConfigPage extends Component {
  static async preload(store, newParams) {
    const { linodeId } = newParams;

    try {
      await store.dispatch(linodes.one(linodeId));

      await Promise.all([
        store.dispatch(kernels.all()),
        store.dispatch(linodes.configs.all(linodeId)),
        store.dispatch(linodes.disks.all(linodeId)),
      ]);
    } catch (e) {
      store.dispatch(setError(e));
    }
  }

  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.renderDiskSlot = renderDiskSlot.bind(this);
    this.getConfig = getConfig.bind(this);
    this.getDisks = getDisks.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.getDiskSlots = getDiskSlots.bind(this);
    this.fillDiskSlots = fillDiskSlots.bind(this);
    this.loadDisks = loadDisks.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.removeDiskSlot = removeDiskSlot.bind(this);

    this.state = {
      loading: true,
      errors: {},
      virtMode: 'paravirt',
      runLevel: 'default',
      comments: '',
      label: '',
      ramLimit: 2048, // TODO: fetch from plan
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

  async componentDidMount() {
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
      await dispatch(push(`/linodes/${this.getLinode().id}/settings/advanced`));
      return;
    }

    const diskSlots = await this.getDiskSlots(true);

    let isCustomRoot = true;
    let initrd = '';
    try {
      isCustomRoot = AVAILABLE_DISK_SLOTS.indexOf(config.root_device.replace('/dev/', '')) === -1;
      initrd = config.initrd;
    } catch (e) {
      // do nothing.
    }

    this.setState({
      diskSlots,
      isCustomRoot,
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
    const { label, comments, ramLimit, runLevel, virtMode, kernel, diskSlots,
            initrd, rootDevice, helpers } = this.state;

    this.setState({ loading: true, errors: {} });

    const data = {
      label,
      comments,
      kernel,
      initrd,
      ram_limit: parseInt(ramLimit, 10),
      run_level: runLevel,
      virt_mode: virtMode,
      disks: diskSlots,
      root_device: rootDevice,
      helpers: {
        disable_updatedb: helpers.disableUpdatedb,
        enable_distro_helper: helpers.enableDistroHelper,
        enable_network_helper: helpers.enableNetworkHelper,
        enable_modules_dep_helper: helpers.enableModulesdepHelper,
      },
    };

    try {
      if (this.props.create) {
        await dispatch(linodes.configs.post(data, linode.id));
      } else {
        const configId = this.getConfig().id;

        // PUT endpoint accepts disks differently.
        const disksByDevice = {};
        data.disks.forEach((id, i) => {
          disksByDevice[AVAILABLE_DISK_SLOTS[i]] = { id };
        });
        data.disks = disksByDevice;

        await dispatch(linodes.configs.put(data, linode.id, configId));
      }

      this.setState({ loading: false });
      dispatch(push(`/linodes/${linode.id}/settings/advanced`));
    } catch (response) {
      this.setState({ loading: false, errors: await reduceErrors(response) });
    }
  }

  renderFormElement(label, field, element) {
    const { errors } = this.state;
    return (
      <FormGroup errors={errors} field={field} className="row">
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

  renderCheckbox(label, field) {
    return (
      <div className="checkbox">
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
        </label>
      </div>
    );
  }

  render() {
    const { create, kernels } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, ramLimit, rootDevice,
      initrd, errors, diskSlots } = this.state;

    return (
      <section className="card">
        <header>
          <h2>
            {create ? 'Add config' : 'Edit config'}
            <HelpButton to="https://example.org" />
          </h2>
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
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>Virtualization mode</legend>
            </div>
            <div className="col-sm-6">
              {this.renderRadio('Paravirtualization', 'virtMode', 'paravirt')}
              {this.renderRadio('Full virtualization', 'virtMode', 'fullvirt')}
            </div>
          </fieldset>
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
          {this.renderFormElement('Memory limit', 'ramLimit', (
            <div>
              <input
                className="col-sm-2 form-control"
                id="config-ramLimit"
                disabled={loading}
                placeholder="Memory limit"
                type="number"
                value={ramLimit}
                onChange={e => this.setState({ ramLimit: e.target.value })}
              />
              <span className="measure-unit">MB</span>
            </div>
           ))}
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
          <fieldset className="form-group row">
            <div className="col-sm-2 label-col">
              <legend>
                Boot helpers
              </legend>
            </div>
            <div className="col-md-6">
              {this.renderCheckbox('Enable distro helper', 'enableDistroHelper')}
              {this.renderCheckbox('Disable updatedb', 'disableUpdatedb')}
              {this.renderCheckbox('Enable modules.dep helper', 'enableModulesdepHelper')}
              {this.renderCheckbox('Enable network helper', 'enableNetworkHelper')}
            </div>
          </fieldset>
          <ErrorSummary errors={errors} />
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={() => this.saveChanges()}
              >{this.props.create ? 'Add config' : 'Save'}</button>
              <Link
                className="btn btn-cancel"
                to={`/linodes/${this.props.params.linodeId}/settings/advanced`}
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
    linodeId: PropTypes.string,
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
