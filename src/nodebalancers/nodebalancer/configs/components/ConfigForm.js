import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import {
  Form, FormGroup, FormGroupError, Input, Select, Checkbox, SubmitButton,
} from 'linode-components/forms';

import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import {
  NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS, NODEBALANCER_CONFIG_CHECKS,
} from '~/constants';


export default class ConfigForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      loading: false,
      port: props.config.port,
      protocol: props.config.protocol,
      stickiness: props.config.stickiness,
      algorithm: props.config.algorithm,
      check: props.config.check,
      checkPassive: props.config.check_passive,
      checkInterval: props.config.check_interval,
      checkTimeout: props.config.check_timeout,
      checkAttempts: props.config.check_attempts,
    };
  }

  onSubmit = async () => {
    const { dispatch, nodebalancer, config } = this.props;
    const {
      port, protocol, algorithm, stickiness, check, checkPassive, checkInterval, checkTimeout,
      checkAttempts,
    } = this.state;

    const data = {
      protocol,
      algorithm,
      stickiness,
      check,
      port: parseInt(port),
      check_passive: checkPassive,
      check_interval: parseInt(checkInterval),
      check_timeout: parseInt(checkTimeout),
      check_attempts: parseInt(checkAttempts),
    };

    const idsPath = [nodebalancer.id, config.id].filter(Boolean);
    await dispatch(dispatchOrStoreErrors.call(this, [
      () => nodebalancers.configs[config.id ? 'put' : 'post'](data, ...idsPath),
      ({ id }) => id !== config.id && push(`/nodebalancers/${nodebalancer.label}/configs/${id}`),
    ]));
  }

  onChange = ({ target: { checked, value, name, type } }) =>
    this.setState({ [name]: type === 'checkbox' ? checked : value })

  render() {
    const { submitText, submitDisabledText } = this.props;
    const {
      port, protocol, algorithm, stickiness, check, checkPassive, checkInterval, checkTimeout,
      checkAttempts, errors, loading,
    } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup errors={errors} name="port" className="row">
          <label className="col-sm-2 col-form-label">Port</label>
          <div className="col-sm-10">
            <Input
              id="port"
              name="port"
              placeholder="0"
              value={port}
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="port" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="protocol" className="row">
          <label className="col-sm-2 col-form-label">Protocol</label>
          <div className="col-sm-10">
            <Select
              id="protocol"
              name="protocol"
              value={protocol}
              onChange={this.onChange}
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="tcp">TCP</option>
            </Select>
            <FormGroupError errors={errors} name="protocol" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="algorithm" className="row">
          <label className="col-sm-2 col-form-label">Algorithm</label>
          <div className="col-sm-10">
            <Select
              id="algorithm"
              name="algorithm"
              value={algorithm}
              onChange={this.onChange}
              options={Array.from(NODEBALANCER_CONFIG_ALGORITHMS.entries()).map(
                (value, label) => ({ value, label }))}
            />
            <div>
              <small className="text-muted">
                Configure how initial client connections are
                allocated across backend nodes.
              </small>
            </div>
            <FormGroupError errors={errors} name="algorithm" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="stickiness" className="row">
          <label className="col-sm-2 col-form-label">Session Stickiness</label>
          <div className="col-sm-10">
            <Select
              id="stickiness"
              name="stickiness"
              value={stickiness}
              onChange={this.onChange}
              options={Array.from(NODEBALANCER_CONFIG_STICKINESS.entries()).map(
                (value, label) => ({ value, label }))}
            />
            <div>
              <small className="text-muted">
                Enable subsequent requests from the same client to
                be routed to the same backend node.
              </small>
            </div>
            <FormGroupError errors={errors} name="stickiness" />
          </div>
        </FormGroup>
        <h3 className="sub-header">Active Health Check</h3>
        <FormGroup errors={errors} name="check" className="row">
          <label className="col-sm-2 col-form-label">Type</label>
          <div className="col-sm-10">
            <Select
              id="check"
              name="check"
              value={check}
              onChange={this.onChange}
              options={Array.from(NODEBALANCER_CONFIG_CHECKS.entries()).map(
                (value, label) => ({ value, label }))}
            />
            <div>
              <small className="text-muted">
                Active health checks proactively check the health of back-end nodes.
              </small>
            </div>
            <FormGroupError errors={errors} name="check" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="check_interval" className="row">
          <label className="col-sm-2 col-form-label">Interval</label>
          <div className="col-sm-10">
            <Input
              id="checkInterval"
              name="checkInterval"
              placeholder="0"
              value={checkInterval}
              onChange={this.onChange}
              type="number"
              label="seconds"
            />
            <FormGroupError errors={errors} name="check_interval" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="check_timeout" className="row">
          <label className="col-sm-2 col-form-label">Timeout</label>
          <div className="col-sm-10">
            <Input
              id="checkTimeout"
              name="checkTimeout"
              placeholder="0"
              value={checkTimeout}
              onChange={this.onChange}
              type="number"
              label="seconds"
            />
            <FormGroupError errors={errors} name="check_timeout" />
          </div>
        </FormGroup>
        <FormGroup errors={errors} name="check_attempts" className="row">
          <label className="col-sm-2 col-form-label">Attempts</label>
          <div className="col-sm-10">
            <Input
              id="checkAttempts"
              name="checkAttempts"
              placeholder="0"
              value={checkAttempts}
              onChange={this.onChange}
              type="number"
            />
            <FormGroupError errors={errors} name="check_attempts" />
            <div>
              <small className="text-muted">
                Take this node out of rotation after this number of failed health checks
              </small>
            </div>
          </div>
        </FormGroup>
        <h3 className="sub-header">Passive Checks</h3>
        <FormGroup errors={errors} name="check_passive" className="row">
          <label className="col-sm-2 col-form-label">Enabled</label>
          <div className="col-sm-10">
            <Checkbox
              label="Enable passive checks based on observed communication with backend nodes."
              id="checkPassive"
              name="checkPassive"
              checked={checkPassive}
              value={checkPassive}
              onChange={this.onChange}
            />
            <FormGroupError errors={errors} name="check_passive" />
          </div>
        </FormGroup>
        <FormGroup className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton
              disabled={loading}
              disabledChildren={submitDisabledText}
            >{submitText}</SubmitButton>
            <FormSummary errors={errors} success="Config settings saved." />
          </div>
        </FormGroup>
      </Form>
    );
  }
}

ConfigForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nodebalancer: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  submitText: PropTypes.string,
  submitDisabledText: PropTypes.string,
};

ConfigForm.defaultProps = {
  config: {
    port: 80,
    protocol: 'http',
    algorithm: 'roundrobin',
    stickiness: 'table',
    check: 'connection',
    check_passive: true,
  },
};
