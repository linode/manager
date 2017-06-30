import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import { CancelButton } from 'linode-components/buttons';
import {
  Form,
  FormGroup,
  FormSummary,
  FormGroupError,
  Input,
  Select,
  Radio,
  RadioInputCombo,
  RadioSelectCombo,
  Checkbox,
  Checkboxes,
  SubmitButton,
} from 'linode-components/forms';

import { EmitEvent } from 'linode-components/utils';
import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { AVAILABLE_DISK_SLOTS } from '~/constants';

import { DiskSelect } from '../../../components';


export default class CreateOrEditConfig extends Component {
  constructor(props) {
    super(props);

    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount() {
    const { config, account } = this.props;

    this.setState({
      label: config.label,
      comments: config.comments,
      kernel: config.kernel,
      initrd: config.initrd || '',
      rootDevice: config.root_device,
      virtMode: config.virt_mode,
      runLevel: config.run_level,
      ramLimit: config.ram_limit,
      disks: config.disks,
      isCustomRoot: AVAILABLE_DISK_SLOTS.indexOf(
        config.root_device.replace('/dev/', '')) === -1,
      isMaxRam: config.ram_limit === 0,
      enableDistroHelper: config.helpers.enable_distro_helper,
      enableNetworkHelper: config.helpers.enable_network_helper,
      enableModulesDepHelper: config.helpers.enable_modules_dep_helper,
      disableUpdatedb: config.helpers.disable_updatedb,
      errors: {},
      loading: null,
    });

    if (!config.id) {
      this.setState({ enableNetworkHelper: account.network_helper });
    }
  }

  onSubmit = () => {
    const { dispatch, linode, config } = this.props;

    const data = {
      label: this.state.label,
      comments: this.state.comments,
      kernel: this.state.kernel,
      disks: this.state.disks,
      // API expects this to be null not ''
      initrd: this.state.initrd || null,
      root_device: this.state.rootDevice,
      virt_mode: this.state.virtMode,
      run_level: this.state.runLevel,
      ram_limit: this.state.isMaxRam ? 0 : parseInt(this.state.ramLimit),
      helpers: {
        enable_distro_helper: this.state.enableDistroHelper,
        enable_network_helper: this.state.enableNetworkHelper,
        enable_modules_dep_helper: this.state.enableModulesDepHelper,
        disable_updatedb: this.state.disableUpdatedb,
      },
    };

    const idsPath = [linode.id, config.id].filter(Boolean);
    return dispatch(dispatchOrStoreErrors.call(this, [
      () => linodes.configs[config.id ? 'put' : 'post'](data, ...idsPath),
      () => push(`/linodes/${linode.label}/settings/advanced`),
      () => EmitEvent('Submit', config.id ? 'edit' : 'add', 'linode config'),
    ]));
  }

  onChange = ({ target: { name, value, type, checked } }) =>
    this.setState({ [name]: type === 'checkbox' ? checked : value })

  render() {
    const { kernels, linode } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, rootDevice, initrd, errors, virtMode,
      runLevel, ramLimit, isMaxRam, disks, enableDistroHelper, enableNetworkHelper,
      enableModulesDepHelper, disableUpdatedb,
    } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup errors={errors} name="label" className="row">
          <label htmlFor="label" className="col-sm-2 col-form-label">Label</label>
          <div className="col-sm-10">
            <Input
              name="label"
              id="label"
              placeholder="My new config"
              value={label}
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="label" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="comments" className="row">
          <label htmlFor="comments" className="col-sm-2 col-form-label">Notes</label>
          <div className="col-sm-10">
            <textarea
              name="comments"
              id="comments"
              placeholder="Notes"
              value={comments}
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="comments" />
          </div>
        </FormGroup>
        <h3 className="sub-header">Virtual Machine Mode</h3>
        <FormGroup errors={errors} name="virtMode" className="row">
          <label className="col-form-label col-sm-2">Virtualization mode</label>
          <div className="col-sm-10">
            <Checkboxes>
              <Radio
                name="virtMode"
                checked={virtMode === 'paravirt'}
                value="paravirt"
                label="Paravirtualization"
                onChange={this.onChange}
              />
              <Radio
                name="virtMode"
                checked={virtMode === 'fullvirt'}
                value="fullvirt"
                onChange={this.onChange}
                label="Full virtualization"
              />
            </Checkboxes>
          </div>
        </FormGroup>
        <h3 className="sub-header">Boot Settings</h3>
        <FormGroup errors={errors} name="kernel" className="row">
          <label htmlFor="kernel" className="col-sm-2 col-form-label">Kernel</label>
          <div className="col-sm-10">
            <Select name="kernel" id="kernel" value={kernel} onChange={this.onChange}>
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
            <FormGroupError errors={errors} name="kernel" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="runLevel" className="row">
          <label className="col-sm-2 col-form-label">Run level</label>
          <div className="col-sm-10">
            <Checkboxes>
              <Radio
                name="runLevel"
                checked={runLevel === 'default'}
                value="default"
                label="Default"
                onChange={this.onChange}
              />
              <Radio
                name="runLevel"
                value="single"
                checked={runLevel === 'single'}
                label="Single-user mode"
                onChange={this.onChange}
              />
              <Radio
                name="runLevel"
                value="binbash"
                checked={runLevel === 'binbash'}
                label="init=/bin/bash"
                onChange={this.onChange}
              />
            </Checkboxes>
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="ram_limit" className="row">
          <label className="col-sm-2 col-form-label">Memory limit</label>
          <div className="col-sm-10">
            <div>
              <Radio
                name="isMaxRam"
                checked={isMaxRam}
                id="isMaxRam-true"
                onChange={this.onChange}
                label={`Maximum (${linode.type.ram} MB)`}
              />
            </div>
            <div>
              <RadioInputCombo
                radioId="isMaxRam-false"
                radioLabel=""
                radioChecked={!isMaxRam}
                radioOnChange={() => this.setState({ isMaxRam: false })}
                inputId="ramLimit"
                inputLabel="MB"
                inputDisabled={isMaxRam}
                inputValue={ramLimit}
                inputOnChange={e => this.setState({ ramLimit: e.target.value })}
              />
              <FormGroupError errors={errors} name="ram_limit" />
            </div>
          </div>
        </FormGroup>
        <h3 className="sub-header">Block Device Assignment</h3>
        {AVAILABLE_DISK_SLOTS.map((slot, i) => (
          <DiskSelect
            key={i}
            errors={errors}
            configuredDisks={disks}
            disks={this.props.disks}
            slot={slot}
            labelClassName="col-sm-2"
            fieldClassName="col-sm-10"
            onChange={({ target: { value, name } }) =>
              this.setState({ disks: { ...this.state.disks, [name]: value || null } })}
          />
        ))}
        <FormGroup className="row">
          <label htmlFor="initrd" className="col-sm-2 col-form-label">initrd</label>
          <div className="col-sm-10">
            <Select name="initrd" id="initrd" value={initrd} onChange={this.onChange}>
              <option value="">-- None --</option>
              <option value="25669">Recovery (Finnix)</option>
            </Select>
          </div>
        </FormGroup>
        <FormGroup className="row" errors={errors} name="root_device">
          <label className="col-sm-2 col-form-label">root / boot device</label>
          <div className="col-sm-10">
            <FormGroup>
              <RadioSelectCombo
                radioChecked={isCustomRoot === false}
                radioOnChange={() => this.setState({
                  isCustomRoot: false,
                  rootDevice: '/dev/sda',
                })}
                radioLabel="Standard"
                selectId="root-device-select"
                selectValue={isCustomRoot ? '/dev/sda' : rootDevice}
                selectDisabled={isCustomRoot}
                selectOnChange={e => this.setState({ rootDevice: e.target.value })}
                selectChildren={AVAILABLE_DISK_SLOTS.map((slot, i) =>
                  <option key={i} value={`/dev/${slot}`}>
                    /dev/{slot}
                  </option>
                )}
              />
              <FormGroupError errors={errors} name={!isCustomRoot ? 'root_device' : ''} />
            </FormGroup>
            <FormGroup>
              <RadioInputCombo
                radioId="isCustomRoot-true"
                radioLabel="Custom"
                radioChecked={isCustomRoot === true}
                radioOnChange={() => this.setState({
                  isCustomRoot: true,
                  rootDevice: '/dev/sda',
                })}
                inputId="custom-root-device"
                inputPlaceholder="/dev/sda"
                inputValue={isCustomRoot ? rootDevice : ''}
                inputDisabled={isCustomRoot === false}
                inputType="text"
                inputOnChange={e => this.setState({ rootDevice: e.target.value })}
              />
              <FormGroupError errors={errors} name={isCustomRoot ? 'root_device' : ''} />
            </FormGroup>
          </div>
        </FormGroup>
        <h3 className="sub-header">Filesystem/Boot Helpers</h3>
        <FormGroup className="row">
          <label className="col-sm-2 col-form-label">Boot helpers</label>
          <div className="col-md-8">
            <Checkboxes>
              <Checkbox
                name="enableDistroHelper"
                id="enableDistroHelper"
                checked={enableDistroHelper}
                onChange={this.onChange}
                label="Enable distro helper"
              />
              <div>
                <small className="text-muted">
                  Helps maintain correct inittab/upstart console device
                </small>
              </div>
              <Checkbox
                name="disableUpdatedb"
                id="disableUpdatedb"
                checked={disableUpdatedb}
                onChange={this.onChange}
                label="Disable updatedb"
              />
              <div>
                <small className="text-muted">
                  Disables updatedb cron job to avoid disk thrashing
                </small>
              </div>
              <Checkbox
                name="enableModulesDepHelper"
                id="enableModulesDepHelper"
                checked={enableModulesDepHelper}
                onChange={this.onChange}
                label="Enable modules.dep helper"
              />
              <div>
                <small className="text-muted">
                  Creates a modules dependency file for the kernel you run
                </small>
              </div>
              <Checkbox
                name="enableNetworkHelper"
                id="enableNetworkHelper"
                checked={enableNetworkHelper}
                onChange={this.onChange}
                label="Enable network helper"
              />
              <div>
                <small className="text-muted">
                  Automatically configure static networking.
                  &nbsp;<a href="https://www.linode.com/docs/platform/network-helper">Learn More</a>
                </small>
              </div>
            </Checkboxes>
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton
              disabled={loading}
              disabledChildren={this.props.submitDisabledText}
            >{this.props.submitText}</SubmitButton>
            <CancelButton to={`/linodes/${linode.label}/settings/advanced`} />
            <FormSummary errors={errors} />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

CreateOrEditConfig.propTypes = {
  dispatch: PropTypes.func.isRequired,
  kernels: PropTypes.object.isRequired,
  linode: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  disks: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  submitText: PropTypes.string,
  submitDisabledText: PropTypes.string,
};

CreateOrEditConfig.defaultProps = {
  config: {
    disks: AVAILABLE_DISK_SLOTS.reduce((disks, slot) => ({ ...disks, [slot]: null }), {}),
    root_device: '',
    helpers: {
      enable_distro_helper: true,
      enable_network_helper: true,
      enable_modules_dep_helper: true,
      disable_updatedb: true,
    },
    kernel: 'linode/latest-64bit',
    virt_mode: 'paravirt',
    run_level: 'default',
    ram_limit: 0,
  },
};
