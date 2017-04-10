import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes } from '~/api';
import { Form,
  FormGroup,
  FormGroupError,
  Input,
  Select,
  Radio,
  RadioInputCombo,
  RadioSelectCombo,
  Checkbox,
  Checkboxes,
} from '~/components/form';
import { ErrorSummary, reduceErrors } from '~/errors';

import { SubmitButton } from '~/components/form';
import { Card, CardHeader } from '~/components/cards';
import { CancelButton, LinkButton } from '~/components/buttons';
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
      <label className="col-sm-2 col-form-label">
        /dev/{AVAILABLE_DISK_SLOTS[index]}:
      </label>
      <div className="col-sm-9 input-container">
        <Select
          id={`config-device-${AVAILABLE_DISK_SLOTS[index]}`}
          value={device}
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
        </Select>
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
      await dispatch(linodes.disks.all([id]));
    } catch (e) {
      dispatch(setError(e));
    }
  }

  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.renderDiskSlot = renderDiskSlot.bind(this);
    this.getConfig = getConfig.bind(this);
    this.getDisks = getDisks.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.getDiskSlots = getDiskSlots.bind(this);
    this.fillDiskSlots = fillDiskSlots.bind(this);
    this.addDiskSlot = addDiskSlot.bind(this);
    this.removeDiskSlot = removeDiskSlot.bind(this);
    const { create } = this.props;

    if (create) {
      const disks = this.getDisks();
      if (disks) {
        const diskSlots = Object.values(disks).map(disk => disk.id).slice(0, 1) || [];
        this.state = {
          diskSlots,
          isCustomRoot: false,
          isMaxRam: true,
          initrd: '',
          loading: false,
          virtMode: 'paravirt',
          runLevel: 'default',
          comments: '',
          label: '',
          ramLimit: 0,
          kernel: 'linode/latest_64',
          rootDevice: '/dev/sda',
          helpers: {
            disableUpdatedb: true,
            enableDistroHelper: true,
            enableNetworkHelper: true,
            enableModulesdepHelper: true,
          },
          errors: {},
        };
      }
      return;
    }

    // If not creating a new config, populate the state with the config values.
    const config = this.getConfig();

    if (!config) {
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

    this.state = {
      diskSlots,
      isCustomRoot,
      isMaxRam,
      initrd: initrd || '',
      loading: false,
      virtMode: config.virt_mode,
      runLevel: config.run_level,
      comments: config.comments,
      label: config.label,
      ramLimit: config.ram_limit,
      kernel: config.kernel,
      rootDevice: config.root_device,
      helpers: {
        disableUpdatedb: config.helpers.disable_updatedb,
        enableDistroHelper: config.helpers.enable_distro_helper,
        enableNetworkHelper: config.helpers.enable_network_helper,
        enableModulesdepHelper: config.helpers.enable_modules_dep_helper,
      },
      errors: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    // If not creating a new config, populate the state with the config values.
    const config = this.getConfig();

    // Config not found. Should we 404?
    if (!config && !this.props.create) {
      dispatch(push(`/linodes/${this.getLinode().label}/settings/advanced`));
    }
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
        errors: Object.freeze(await reduceErrors(response)),
      }, resolve));
    }
  }

  render() {
    // remove me :(
    if (!this.state) {
      return null;
    }
    const { create, kernels, params: { linodeLabel } } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, ramLimit, rootDevice,
      initrd, errors, diskSlots, virtMode, runLevel, isMaxRam,
    } = this.state;
    const {
      enableDistroHelper, enableNetworkHelper, enableModulesdepHelper, disableUpdatedb,
    } = this.state.helpers;
    const linode = this.getLinode();
    return (
      <Card
        header={
          <CardHeader title={create ? 'Add config' : 'Edit config'} navLink="https://example.org" />
        }
      >
        <Form onSubmit={() => this.saveChanges()}>
          <h3 className="sub-header">Label and Note</h3>
          <FormGroup errors={errors} name="label" className="row">
            <label className="col-sm-2 col-form-label">Label</label>
            <div className="col-sm-6">
              <Input
                id="config-label"
                placeholder="My new config"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} name="comments" className="row">
            <label className="col-sm-2 col-form-label">Notes</label>
            <div className="col-sm-6">
              <textarea
                id="config-comments"
                placeholder="Notes"
                value={comments}
                disabled={loading}
                onChange={e => this.setState({ comments: e.target.value })}
              />
              <FormGroupError errors={errors} name="comments" />
            </div>
          </FormGroup>
          <h3 className="sub-header">Virtual Machine Mode</h3>
          <FormGroup errors={errors} name="virtMode" className="row">
            <label className="col-form-label col-sm-2">Virtualization mode</label>
            <div className="col-sm-3">
              <Checkboxes>
                <Radio
                  checked={virtMode === 'paravirt'}
                  onChange={() => this.setState({ virtMode: 'paravirt' })}
                  label="Paravirtualization"
                />
                <Radio
                  id="config-virtMode-fullvirt"
                  checked={virtMode === 'fullvirt'}
                  onChange={() => this.setState({ virtMode: 'fullvirt' })}
                  label="Full virtualization"
                />
              </Checkboxes>
            </div>
          </FormGroup>
          <h3 className="sub-header">Block Device Assignment</h3>
          <FormGroup errors={errors} name="kernel" className="row">
            <label className="col-sm-2 col-form-label">Kernel</label>
            <div className="col-sm-6">
              <Select
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
              </Select>
            </div>
          </FormGroup>
          <FormGroup errros={errors} name="runLevel" className="row">
            <fieldset className="form-group">
              <label className="col-sm-2 col-form-label">Run level</label>
              <div className="col-sm-6">
                <Checkboxes>
                  <Radio
                    checked={runLevel === 'default'}
                    onChange={() => this.setState({ runLevel: 'default' })}
                    label="Default"
                  />
                  <Radio
                    id="config-runLevel-single"
                    checked={runLevel === 'single'}
                    onChange={() => this.setState({ runLevel: 'single' })}
                    label="Single-user mode"
                  />
                  <Radio
                    checked={runLevel === 'binbash'}
                    onChange={() => this.setState({ runLevel: 'binbash' })}
                    label="init=/bin/bash"
                  />
                </Checkboxes>
              </div>
            </fieldset>
          </FormGroup>
          <FormGroup errors={errors} name="ram_limit" className="row">
            <label className="col-sm-2 col-form-label">Memory limit</label>
            <div className="col-sm-10">
              <div>
                <Radio
                  checked={isMaxRam === true}
                  id="config-isMaxRam-true"
                  onChange={() => this.setState({ isMaxRam: true })}
                  label={`Maximum (${linode.type.length ? linode.type[0].ram : null} MB)`}
                />
              </div>
              <div>
                <RadioInputCombo
                  radioId="config-isMaxRam-false"
                  radioLabel=""
                  radioChecked={isMaxRam === false}
                  radioOnChange={() => this.setState({ isMaxRam: false })}
                  inputId="config-ramLimit"
                  inputLabel="MB"
                  inputDisabled={isMaxRam === true}
                  inputValue={ramLimit}
                  inputOnChange={e => this.setState({ ramLimit: e.target.value })}
                />
                <FormGroupError errors={errors} name="ram_limit" />
              </div>
            </div>
          </FormGroup>
          {diskSlots.map(this.renderDiskSlot)}
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">initrd</label>
            <div className="input-container col-sm-6">
              <Select
                id="config-initrd"
                value={initrd}
                onChange={e => this.setState({ initrd: e.target.value })}
              >
                <option value="">No initrd</option>
                <option value="25669">Recovery - Finnix (initrd)</option>
              </Select>
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">root / boot device</label>
            <div className="input-container col-sm-10">
              <FormGroup>
                <RadioSelectCombo
                  radioChecked={isCustomRoot === false}
                  radioOnChange={() => this.setState({
                    isCustomRoot: false,
                    rootDevice: '/dev/sda',
                  })}
                  radioLabel="Standard"
                  selectId="config-root-device-select"
                  selectValue={isCustomRoot ? '/dev/sda' : rootDevice}
                  selectDisabled={loading || isCustomRoot}
                  selectOnChange={e => this.setState({ rootDevice: e.target.value })}
                  selectChildren={diskSlots.map((_, i) =>
                    <option key={i} value={`/dev/${AVAILABLE_DISK_SLOTS[i]}`}>
                      /dev/{AVAILABLE_DISK_SLOTS[i]}
                    </option>
                  )}
                />
              </FormGroup>
              <FormGroup errors={errors} name="root_device">
                <RadioInputCombo
                  radioId="config-isCustomRoot-true"
                  radioLabel="Custom"
                  radioChecked={isCustomRoot === true}
                  radioOnChange={() => this.setState({
                    isCustomRoot: true,
                    rootDevice: '/dev/sda',
                  })}
                  inputId="config-custom-root-device"
                  inputPlaceholder="/dev/sda"
                  inputValue={isCustomRoot ? rootDevice : ''}
                  inputDisabled={isCustomRoot === false}
                  inputType="text"
                  inputOnChange={e => this.setState({ rootDevice: e.target.value })}
                />
                <FormGroupError errors={errors} name="root_device" />
              </FormGroup>
            </div>
          </div>
          <h3 className="sub-header">Filesystem/Boot Helpers</h3>
          <fieldset className="form-group row">
            <label className="col-sm-2 col-form-label">Boot helpers</label>
            <div className="col-md-8">
              <Checkbox
                id="config-enableDistroHelper"
                checked={enableDistroHelper}
                onChange={() => this.setState({
                  helpers: {
                    ...this.state.helpers,
                    enableDistroHelper: !enableDistroHelper,
                  },
                })}
                label="Enable distro helper"
              />
              <div>
                <small className="text-muted">
                  Helps maintain correct inittab/upstart console device
                </small>
              </div>
              <Checkbox
                id="config-disableUpdatedb"
                checked={disableUpdatedb}
                onChange={() => this.setState({
                  helpers: {
                    ...this.state.helpers,
                    disableUpdatedb: !disableUpdatedb,
                  },
                })}
                label="Disable updatedb"
              />
              <div>
                <small className="text-muted">
                  Disables updatedb cron job to avoid disk thrashing
                </small>
              </div>
              <Checkbox
                id="config-enableModulesdepHelper"
                checked={enableModulesdepHelper}
                onChange={() => this.setState({
                  helpers: {
                    ...this.state.helpers,
                    enableModulesdepHelper: !enableModulesdepHelper,
                  },
                })}
                label="Enable modules.dep helper"
              />
              <div>
                <small className="text-muted">
                  Creates a modules dependency file for the kernel you run
                </small>
              </div>
              <Checkbox
                id="config-enableNetworkHelper"
                checked={enableNetworkHelper}
                onChange={() => this.setState({
                  helpers: {
                    ...this.state.helpers,
                    enableNetworkHelper: !enableNetworkHelper,
                  },
                })}
                label="Enable network helper"
              />
              <div>
                <small className="text-muted">
                  Automatically configure static networking
                  <a href="https://www.linode.com/docs/platform/network-helper">(more info)</a>
                </small>
              </div>
            </div>
          </fieldset>
          <ErrorSummary errors={errors} />
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton>{this.props.create ? 'Add config' : 'Save'}</SubmitButton>
              <CancelButton to={`/linodes/${linodeLabel}/settings/advanced`} />
            </div>
          </div>
        </Form>
      </Card>
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
