import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { linodes, kernels } from '~/api';
import { parallel } from '~/api/util';
import HelpButton from '~/components/HelpButton';
import { ErrorSummary, FormGroup, reduceErrors } from '~/errors';
import { Link } from '~/components/Link';
import { setSource } from '~/actions/source';

export class ConfigEdit extends Component {
  constructor() {
    super();
    this.getLinode = getLinode.bind(this);
    this.renderUI = this.renderUI.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.renderDiskSlot = this.renderDiskSlot.bind(this);
    this.state = {
      loading: true,
      errors: {},
      virt_mode: 'paravirt',
      run_level: 'default',
      comments: '',
      label: '',
      ram_limit: 0,
      kernel: 'linode/latest',
      root_device: '/dev/sda',
      root_device_custom: '',
      boot_device: 'standard',
      disks: {
        sda: { id: 'none' },
        sdb: null,
        sdc: null,
        sdd: null,
        sde: null,
        sdf: null,
        sdg: null,
        sdh: null,
      },
      helpers: {
        disable_updatedb: true,
        enable_distro_helper: true,
        enable_network_helper: true,
        enable_modules_dep_helper: true,
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    const { linodeId, configId } = this.props.params;
    await dispatch(parallel(
      kernels.all(),
      linodes.one(linodeId),
      linodes.configs.all(linodeId),
      linodes.disks.all(linodeId),
    ));
    const linode = this.getLinode();
    if (linode._configs.configs[Number.parseInt(configId)]) {
      const config = linode._configs.configs[configId];
      const disks = Object.keys(config.disks);
      const diskIndex = disks.indexOf(config.root_device.replace('/dev/', ''));
      const bootDevice = diskIndex >= 0 ? 'standard' : 'custom';
      this.setState({
        ...config,
        loading: false,
        disks: config.disks,
        kernel: config.kernel,
        boot_device: bootDevice,
        root_device_custom: (bootDevice === 'custom' ? config.root_device : ''),
      });
    } else if (configId !== 'create') {
      dispatch(push(`/linodes/${linodeId}/settings/advanced`));
    } else {
      this.setState({
        loading: false,
        ram_limit: linode.type[0].ram,
      });
    }
  }

  getConfig() {
    const linode = this.getLinode();
    if (!linode) {
      return null;
    }
    const configId = parseInt(this.props.params.configId);
    return linode._configs.configs[configId] || null;
  }

  addDisk(disk) {
    const disks = Object.keys(this.state.disks);
    const newDisk = disks[disks.indexOf(disk) + 1];
    if (newDisk) {
      this.setState({
        disks: { ...this.state.disks, [newDisk]: { id: 'none' } },
      });
    }
  }

  deleteDisk(disk) {
    const disks = Object.keys(this.state.disks);

    if (disk !== disks[0]) {
      this.setState({
        disks: { ...this.state.disks, [disk]: null },
      });
    }
  }

  renderDiskSlot(device, index) {
    const { disks, loading } = this.state;
    if (!disks[device]) {
      return null;
    }

    const slotsInUse = [];
    Object.values(disks).forEach(disk => {
      if (disk) {
        slotsInUse.push(disk);
      }
    });
  
    const numDisks = Object.values(disks).length;
    const oneDiskInUse = index === 0 && slotsInUse.length === 0;
    const currentDisk = index === slotsInUse.length - 1;
    const allDisksInUse = index === numDisks - 1;

    const addButton = oneDiskInUse || currentDisk && !allDisksInUse ?
      <button
        className="add-disk-btn"
        disabled={loading}
        onClick={() => this.addDisk(device)}
      >Add disk</button> : null;

    const deleteButton = index > 0 && index === slotsInUse.length - 1 ?
      <button
        className="delete-disk-btn"
        disabled={loading}
        onClick={() => this.deleteDisk(device)}
      >Delete disk</button> : null;

    const addDeleteButtons = (
      <div className="disk-slot-btns">
        { addButton }
        { deleteButton }
      </div>);

    return (
      <div
        className={`form-group row disk-slots ${device}`}
        key={`config-device-row-${device}`}
      >
        <label className="col-sm-2 col-form-label" key={`config-device-label-${device}`}>
          /dev/{device}
        </label>
        <div className="col-sm-6" key={`config-device-field-${device}`}>
          <select
            className="form-control disk-select pull-left"
            id={`config-device-${device}`}
            value={device}
            disabled={loading}
            onChange={e => this.setState({
              disks: { ...disks, [device]: { id: parseInt(e.target.value) } },
            })}
          >
            <option key="none" value="none" disabled>None</option>
            {Object.keys(disks).map(disk =>
              <option key={disk} value={disk}>
                {disks[disk] ? disks[disk].label : null}
              </option>
            )}
          </select>
          { addDeleteButtons }
        </div>
      </div>
    );
  }

  async saveChanges(isCreate) {
    const state = this.state;
    const { dispatch } = this.props;
    const { configId } = this.props.params;
    const linode = this.getLinode();

    const rootDevice = state.boot_device === 'custom'
      ? state.root_device_custom : state.root_device;

    this.setState({ loading: true, errors: {} });

    try {
      if (isCreate) {
        await dispatch(linodes.configs.post({
          label: state.label,
          comments: state.comments,
          ram_limit: state.ram_limit,
          run_level: state.run_level,
          virt_mode: state.virt_mode,
          kernel: state.kernel,
          disks: state.disks,
          root_device: rootDevice,
          helpers: {
            disable_updatedb: state.helpers.disable_updatedb,
            enable_distro_helper: state.helpers.enable_distro_helper,
            enable_network_helper: state.helpers.enable_network_helper,
            enable_modules_dep_helper: state.helpers.enable_modules_dep_helper,
          },
        }, linode.id));
      } else {
        await dispatch(linodes.configs.put({
          label: state.label,
          comments: state.comments,
          ram_limit: state.ram_limit,
          run_level: state.run_level,
          virt_mode: state.virt_mode,
          kernel: state.kernel,
          disks: state.disks,
          root_device: rootDevice,
          helpers: {
            disable_updatedb: state.helpers.disable_updatedb,
            enable_distro_helper: state.helpers.enable_distro_helper,
            enable_network_helper: state.helpers.enable_network_helper,
            enable_modules_dep_helper: state.helpers.enable_modules_dep_helper,
          },
        }, linode.id, configId));
      }
      this.setState({ loading: false });
      dispatch(push(`/linodes/${linode.id}/settings/advanced`));
    } catch (response) {
      this.setState({ loading: false, errors: await reduceErrors(response) });
    }
  }

  renderUI() {
    const { kernels } = this.props;
    const { configId } = this.props.params;
    const isCreate = configId === 'create';
    const linode = this.getLinode();
    const disks = linode._disks.disks;
    const state = this.state;
    const input = (display, field, control) => (
      <FormGroup errors={state.errors} field={field} className="row">
        <label
          htmlFor={`config-${field}`}
          className="col-sm-2 col-form-label"
        >{display}</label>
        <div className="col-sm-5">{control}</div>
      </FormGroup>);
    const text = (display, field) => input(display, field,
      <input
        className="form-control"
        id={`config-${field}`}
        disabled={state.loading}
        placeholder={display}
        value={state[field]}
        onChange={e => this.setState({ [field]: e.target.value })}
      />);
    const radio = (display, field, value) => (
      <div className="form-check">
        <label>
          <input
            className="form-check-input"
            type="radio"
            name={`config-${field}`}
            id={`config-${field}-${value}`}
            disabled={state.loading}
            value={value}
            checked={state[field] === value}
            onChange={e => this.setState({ [field]: e.target.value })}
          /> {display}
        </label>
      </div>);
    const checkbox = (display, field) => (
      <div className="form-check">
        <label>
          <input
            className={`form-check-input ${field}-checkbox`}
            type="checkbox"
            name={`config-${field}`}
            id={`config-${field}`}
            disabled={state.loading}
            checked={!!state.helpers[field]}
            onChange={e => this.setState({
              helpers: { ...state.helpers, [field]: e.target.checked },
            })}
          /> {display}
        </label>
      </div>);



    return (
      <div>
        {text('Label', 'label')}
        {input('Notes', 'comments',
          <textarea
            className="form-control"
            id="config-comments"
            placeholder="Notes"
            value={state.comments}
            disabled={state.loading}
            onChange={e => this.setState({ comments: e.target.value })}
          />)}
        <div className="form-group row">
          <label
            htmlFor="config-kernel"
            className="col-sm-2 col-form-label"
          >Kernel</label>
          <div className="col-sm-4">
            <select
              className="form-control"
              id="config-kernel"
              value={state.kernel}
              disabled={state.loading}
              onChange={e => this.setState({ kernel: e.target.value })}
            >{Object.values(kernels.kernels).map(kernel => {
              const map = {
                'linode/latest': 'Latest 32-bit kernel',
                'linode/latest_64': 'Latest 64-bit kernel',
              };
              return (
                <option key={kernel.id} value={kernel.id}>
                  {map[kernel.id] || kernel.label}
                </option>);
            })}</select>
          </div>
        </div>
        <fieldset className="form-group row">
          <legend className="col-sm-2 col-form-legend">
            Helpers
          </legend>
          <div className="col-md-3">
            {checkbox('Enable distro helper', 'enable_distro_helper')}
            {checkbox('Enable network helper', 'enable_network_helper')}
            {checkbox('Enable modules.dep helper', 'enable_modules_dep_helper')}
            {checkbox('Disable updatedb', 'disable_updatedb')}
          </div>
        </fieldset>
        <fieldset className="form-group row">
          <legend className="col-form-legend col-sm-2">
            Virtualization mode
          </legend>
          <div className="col-sm-3">
            {radio('Paravirtualization', 'virt_mode', 'paravirt')}
            {radio('Full virtualization', 'virt_mode', 'fullvirt')}
          </div>
        </fieldset>
        <fieldset className="form-group row">
          <legend className="col-form-legend col-sm-2">
            Run level
          </legend>
          <div className="col-sm-3">
            {radio('Default', 'run_level', 'default')}
            {radio('Single-user mode', 'run_level', 'single')}
            {radio('init=/bin/bash', 'run_level', 'binbash')}
          </div>
        </fieldset>
        {input('Memory limit', 'ram_limit',
          <div className="content-col">
            <input
              className="col-sm-3"
              id="config-ram_limit"
              disabled={state.loading}
              placeholder="Memory limit"
              value={state.ram_limit}
              onChange={e => this.setState({ ram_limit: e.target.value })}
            />
            <span className="measure-unit">MB</span>
          </div>)}
        {Object.keys(state.disks).map(this.renderDiskSlot)}
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">root / boot device</label>
          <div className="col-sm-8">
            {radio((
              <div>
                <span className="col-sm-3 custom-label-root">
                  Standard
                </span>
                <div className="col-sm-7 custom-root-device">
                  <select
                    className="form-control root-device-select"
                    id="config-root-device-select"
                    value={state.root_device}
                    disabled={state.loading}
                    onChange={e => this.setState({ root_device: e.target.value })}
                  >
                    {Object.keys(state.disks).map(device => {
                      if (state.disks[device]) {
                        return (
                          <option key={`/dev/${device}`} value={`/dev/${device}`}>
                            /dev/{device}
                          </option>
                        );
                      }
                    })}
                  </select>
                </div>
              </div>
            ), 'boot_device', 'standard')}
            {radio((
              <div>
                <span className="col-sm-3 custom-label-root">
                  Custom
                </span>
                <div className="col-sm-7 custom-root-device">
                  <input
                    type="text"
                    className="form-control"
                    id="config-custom-root-device"
                    disabled={state.loading}
                    placeholder={state.root_device}
                    value={state.root_device_custom}
                    onChange={e => this.setState({ root_device_custom: e.target.value })}
                  />
                </div>
              </div>
            ), 'boot_device', 'custom')}
          </div>
        </div>
        <ErrorSummary errors={state.errors} />
        <button
          className="btn btn-primary"
          disabled={state.loading}
          onClick={() => this.saveChanges(isCreate)}
        >{isCreate ? 'Add config' : 'Save'}</button>
        <Link
          className="btn btn-default"
          style={{ marginLeft: '0.5rem' }}
          to={`/linodes/${this.props.params.linodeId}/settings/advanced`}
        >Cancel</Link>
      </div>
    );
  }

  render() {
    const { configId } = this.props.params;

    return (
      <section className="card">
        <header>
          <h2>
            {configId === 'create' ? 'Add config' : 'Edit config'}
            <HelpButton to="https://example.org" />
          </h2>
        </header>
        {this.renderUI()}
      </section>
    );
  }
}

ConfigEdit.propTypes = {
  linodes: PropTypes.object.isRequired,
  kernels: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    linodeId: PropTypes.string,
    configId: PropTypes.string,
  }),
};

function select(state) {
  return {
    linodes: state.api.linodes,
    kernels: state.api.kernels,
  };
}

export default connect(select)(ConfigEdit);
