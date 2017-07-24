import React, { Component, PropTypes } from 'react';
import { push } from 'react-router-redux';

import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  Input,
  Select,
  Checkbox,
  SubmitButton,
} from 'linode-components/forms';

import { nodebalancers } from '~/api';
import { updateConfigSSL } from '~/api/nodebalancers';
import { dispatchOrStoreErrors } from '~/api/util';
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
      checkPath: props.config.check_path,
      checkBody: props.config.check_body,
      checkPassive: props.config.check_passive,
      checkInterval: props.config.check_interval,
      checkTimeout: props.config.check_timeout,
      checkAttempts: props.config.check_attempts,
      sslCert: props.config.ssl_cert,
      sslKey: props.config.ssl_key,
    };
  }

  onSubmit = () => {
    const { dispatch, nodebalancer, config } = this.props;
    const {
      port, protocol, algorithm, stickiness, check, checkPassive, checkInterval, checkTimeout,
      checkAttempts, sslCert, sslKey, checkPath, checkBody,
    } = this.state;

    const data = {
      protocol,
      algorithm,
      stickiness,
      check,
      port: parseInt(port),
      check_passive: checkPassive,
      check_body: checkBody,
      check_path: checkPath,
      check_interval: parseInt(checkInterval),
      check_timeout: parseInt(checkTimeout),
      check_attempts: parseInt(checkAttempts),
    };

    const sslData = {};
    if (protocol === 'https') {
      if (!config.id) {
        data.ssl_cert = sslCert;
        data.ssl_key = sslKey;
      } else {
        sslData.ssl_cert = sslCert;
        sslData.ssl_key = sslKey;
      }
    }

    const idsPath = [nodebalancer.id, config.id].filter(Boolean);
    const calls = [];
    if ((config.id && protocol === 'https') &&
        (config.protocol !== 'https' || (sslCert || sslKey))) {
      calls.push(() => updateConfigSSL(sslData, ...idsPath));
    }
    calls.push(() => nodebalancers.configs[config.id ? 'put' : 'post'](data, ...idsPath));

    if (!config.id) {
      calls.push(({ id }) => push(`/nodebalancers/${nodebalancer.label}/configs/${id}`));
    }

    return dispatch(dispatchOrStoreErrors.call(this, calls));
  }

  onChange = ({ target: { checked, value, name, type } }) =>
    this.setState({ [name]: type === 'checkbox' ? checked : value })

  render() {
    const { submitText, submitDisabledText, config } = this.props;
    const {
      port, protocol, algorithm, stickiness, check, checkPassive, checkInterval, checkTimeout,
      checkAttempts, sslCert, sslKey, checkPath, checkBody, errors, loading,
    } = this.state;

    return (
      <Form
        onSubmit={this.onSubmit}
        analytics={{ title: 'NodeBalancer Config Settings', action: config.id ? 'edit' : 'add' }}
      >
        <FormGroup errors={errors} name="port" className="row">
          <label className="col-sm-2 col-form-label">Port</label>
          <div className="col-sm-10">
            <Input
              id="port"
              name="port"
              placeholder="80"
              type="number"
              min={0}
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
              <option value="tcp">TCP</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
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
                ([value, label]) => ({ value, label }))}
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
                ([value, label]) => ({ value, label }))}
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
        {protocol === 'https' ?
          <span>
            <h3 className="sub-header">SSL Settings</h3>
            <FormGroup errors={errors} name="ssl_cert" className="row">
              <label htmlFor="sslCert" className="col-sm-2 col-form-label">SSL Certificate</label>
              <div className="col-sm-10">
                <textarea
                  id="sslCert"
                  name="sslCert"
                  placeholder="SSL certificate (including chained intermediate
                    certificates if needed)"
                  value={sslCert}
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="ssl_cert" />
              </div>
            </FormGroup>
            <FormGroup errors={errors} name="ssl_key" className="row">
              <label htmlFor="sslKey" className="col-sm-2 col-form-label">Private Key</label>
              <div className="col-sm-10">
                <textarea
                  id="sslKey"
                  name="sslKey"
                  placeholder="Unpassphrassed SSL private key"
                  value={sslKey}
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="ssl_key" />
              </div>
            </FormGroup>
          </span>
        : null}
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
                ([value, label]) => ({ value, label }))}
            />
            <div>
              <small className="text-muted">
                Active health checks proactively check the health of back-end nodes.
              </small>
            </div>
            <FormGroupError errors={errors} name="check" />
          </div>
        </FormGroup>
        {check === 'connection' ? null : (
          <FormGroup errors={errors} name="check_path" className="row">
            <label htmlFor="checkPath" className="col-sm-2 col-form-label">
              HTTP Path to Check
            </label>
            <div className="col-sm-10">
              <Input
                id="checkPath"
                name="checkPath"
                value={checkPath}
                onChange={this.onChange}
              />
              <FormGroupError errors={errors} name="check_path" />
            </div>
          </FormGroup>
        )}
        {check !== 'http_body' ? null : (
          <FormGroup errors={errors} name="check_body" className="row">
            <label htmlFor="checkBody" className="col-sm-2 col-form-label">HTTP Body Regex</label>
            <div className="col-sm-10">
              <Input
                id="checkBody"
                name="checkBody"
                value={checkBody}
                onChange={this.onChange}
              />
              <div>
                <small className="text-muted">
                  A regex to match within the first 16,384 bytes of the response body.
                </small>
              </div>
              <FormGroupError errors={errors} name="check_body" />
            </div>
          </FormGroup>
        )}
        <FormGroup errors={errors} name="check_interval" className="row">
          <label className="col-sm-2 col-form-label">Interval</label>
          <div className="col-sm-10">
            <Input
              id="checkInterval"
              name="checkInterval"
              placeholder="0"
              min={0}
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
              min={0}
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
              min={0}
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
    protocol: 'http',
    algorithm: 'roundrobin',
    stickiness: 'table',
    check: 'connection',
    check_passive: true,
    check_path: '',
    check_body: '',
  },
};
