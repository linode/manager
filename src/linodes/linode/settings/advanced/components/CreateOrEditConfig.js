import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import { CancelButton, ExternalLink } from 'linode-components/buttons';
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
  Textarea,
} from 'linode-components/forms';

import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import { AVAILABLE_DISK_SLOTS } from '~/constants';

import { DeviceSelect } from '../../../components';


export default class CreateOrEditConfig extends Component {
  constructor(props) {
    super(props);

    this.state = { errors: {}, loading: false };

    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount(nextProps) {
    const { config, account, linode } = nextProps || this.props;

    this.setState({
      label: config.label,
      comments: config.comments,
      kernel: config.kernel,
      initrd: config.initrd || '',
      rootDevice: config.root_device,
      devices: _.mapValues(config.devices, d => JSON.stringify(_.pickBy(d, Boolean))),
      virtMode: config.virt_mode,
      runLevel: config.run_level,
      ramLimit: config.ram_limit,
      isCustomRoot: AVAILABLE_DISK_SLOTS[linode.hypervisor].indexOf(
        config.root_device.replace('/dev/', '')) === -1,
      isMaxRam: config.ram_limit === 0,
      enableDistroHelper: config.helpers.enable_distro_helper,
      enableNetworkHelper: config.helpers.enable_network_helper,
      enableModulesDepHelper: config.helpers.enable_modules_dep_helper,
      disableUpdatedb: config.helpers.disable_updatedb,
      ...this.state,
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
      devices: DeviceSelect.format(this.state.devices),
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
    ]));
  }

  onChange = ({ target: { name, value, type, checked } }) =>
    this.setState({ [name]: type === 'checkbox' ? checked : value })

  kernelOptions() {
    const { kernels } = this.props;

    const ungroupedKernelOptions = _.sortBy(_.map(kernels.kernels, kernel => ({
      ...kernel,
      value: kernel.id,
    })), 'version').reverse();

    return [
      {
        label: 'Current',
        options: _.filter(ungroupedKernelOptions, 'current'),
      },
      {
        label: 'Deprecated',
        options: _.filter(ungroupedKernelOptions, 'deprecated'),
      },
    ];
  }
  render() {
    const { linode, config } = this.props;
    const {
      loading, label, comments, kernel, isCustomRoot, rootDevice, initrd, errors, virtMode,
      runLevel, ramLimit, isMaxRam, devices, enableDistroHelper, enableNetworkHelper,
      enableModulesDepHelper, disableUpdatedb,
    } = this.state;
    const defaultRootDevice = `/dev/${AVAILABLE_DISK_SLOTS[linode.hypervisor][0]}`;


    return (
      <Form
        onSubmit={this.onSubmit}
        analytics={{ title: 'Linode Config Settings', action: config.id ? 'edit' : 'add' }}
      >
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
            <Textarea
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
            <Select
              className="input-md"
              name="kernel"
              id="kernel"
              value={kernel}
              onChange={this.onChange}
              options={this.kernelOptions()}
            />
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
        {AVAILABLE_DISK_SLOTS[linode.hypervisor].map((slot, i) => (
          <DeviceSelect
            key={i}
            errors={errors}
            configuredDevices={devices}
            disks={this.props.disks}
            volumes={this.props.volumes}
            slot={slot}
            labelClassName="col-sm-2"
            fieldClassName="col-sm-10"
            onChange={({ target: { value, name } }) =>
              this.setState({ devices: { ...this.state.devices, [name]: value } })}
          />
        ))}
        <FormGroup className="row">
          <label htmlFor="initrd" className="col-sm-2 col-form-label">initrd</label>
          <div className="col-sm-10">
            <Select
              name="initrd"
              id="initrd"
              value={initrd}
              onChange={this.onChange}
              options={[
                { value: '', label: '-- None --' },
                { value: '25669', label: 'Recover (Finnix)' },
              ]}
            />
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
                  rootDevice: defaultRootDevice,
                })}
                radioLabel="Standard"
                selectId="root-device-select"
                selectValue={isCustomRoot ? defaultRootDevice : rootDevice}
                selectDisabled={isCustomRoot}
                selectOnChange={e => this.setState({ rootDevice: e.target.value })}
                selectOptions={AVAILABLE_DISK_SLOTS[linode.hypervisor].map((slot) => ({
                  value: `/dev/${slot}`, label: `/dev/${slot}`,
                }))}
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
                  rootDevice: defaultRootDevice,
                })}
                inputId="custom-root-device"
                inputPlaceholder={defaultRootDevice}
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
                  &nbsp;<ExternalLink to="https://www.linode.com/docs/platform/network-helper">Learn More</ExternalLink>
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
  volumes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  submitText: PropTypes.string,
  submitDisabledText: PropTypes.string,
};

CreateOrEditConfig.defaultProps = {
  config: {
    devices: {},
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
