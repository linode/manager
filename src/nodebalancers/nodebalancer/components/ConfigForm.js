import React, { Component, PropTypes } from 'react';
import { Form,
  FormGroup,
  FormGroupError,
  Input,
  Select,
  Checkbox,
} from '~/components/form';
import { ErrorSummary } from '~/errors';
import { SubmitButton } from '~/components/form';

export class ConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      port: props.port,
      protocol: props.protocol,
      algorithm: props.algorithm,
      stickiness: props.stickiness,
      check: props.check,
      checkPassive: props.checkPassive,
      checkInterval: props.checkInterval,
      checkTimeout: props.checkTimeout,
      checkAttempts: props.checkAttempts,
    };
  }
  onChange = ({ target: { checked, value, name, type } }) => {
    this.setState({ [name]: type === 'checkbox' ? checked : value });
  };

  render() {
    const { saveChanges, loading, errors, submitText, nodebalancerConfigId } = this.props;
    const {
      port,
      protocol,
      algorithm,
      stickiness,
      check,
      checkPassive,
      checkInterval,
      checkTimeout,
      checkAttempts,
    } = this.state;
    return (
      <Form
        onSubmit={async () => {
          const values = { nodebalancerConfigId,
            ...this.state,
            checkInterval: parseInt(checkInterval),
            checkTimeout: parseInt(checkTimeout),
            checkAttempts: parseInt(checkAttempts),
          };
          await saveChanges(values);
        }}
      >
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
              disabled={loading}
              onChange={this.onChange}
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="tcp">TCP</option>
            </Select>
          </div>
          <FormGroupError errors={errors} name="protocol" />
        </FormGroup>
        <FormGroup errors={errors} name="algorithm" className="row">
          <label className="col-sm-2 col-form-label">Algorithm</label>
          <div className="col-sm-10">
            <Select
              id="algorithm"
              name="algorithm"
              value={algorithm}
              disabled={loading}
              onChange={this.onChange}
            >
              <option value="roundrobin">Round Robin</option>
              <option value="leastconn">Least Connections</option>
              <option value="source">Source IP</option>
            </Select>
            <div className="text-muted">
              Configure how initial client connections are allocated across backend nodes.
            </div>
          </div>
          <FormGroupError errors={errors} name="algorithm" />
        </FormGroup>
        <FormGroup errors={errors} name="stickiness" className="row">
          <label className="col-sm-2 col-form-label">Session Stickiness</label>
          <div className="col-sm-10">
            <Select
              id="stickiness"
              name="stickiness"
              value={stickiness}
              disabled={loading}
              onChange={this.onChange}
            >
              <option value="table">Table</option>
              <option value="http_cookie">HTTP Cookie</option>
              <option value="none">None</option>
            </Select>
            <div className="text-muted">
              Enable subsequent requests from the same client to be routed to the same backend node.
            </div>
          </div>
          <FormGroupError errors={errors} name="stickiness" />
        </FormGroup>
        <h3 className="sub-header">Active Health Check</h3>
        <FormGroup errors={errors} name="check" className="row">
          <label className="col-sm-2 col-form-label">Health check type</label>
          <div className="col-sm-10">
            <Select
              id="check"
              name="check"
              value={check}
              disabled={loading}
              onChange={this.onChange}
            >
              <option value="connection">TCP Connection</option>
              <option value="http">HTTP Valid Status</option>
              <option value="http_body">HTTP Body Regex</option>
            </Select>
            <div className="text-muted">
              Active health checks proactively check the health of back-end nodes.
            </div>
          </div>
          <FormGroupError errors={errors} name="check" />
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
            />
            <span className="text-muted">seconds</span>
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
            />
            <span className="text-muted">seconds</span>
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
            />
            <div className="text-muted">
              Take this node out of rotation after this number of failed health checks
            </div>
            <FormGroupError errors={errors} name="check_attempts" />
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
          </div>
          <FormGroupError errors={errors} name="check_passive" />
        </FormGroup>
        <ErrorSummary errors={errors} />
        <div className="row">
          <div className="offset-sm-2 col-sm-10">
            <SubmitButton>{submitText}</SubmitButton>
          </div>
        </div>
      </Form>
    );
  }
}

ConfigForm.propTypes = {
  saveChanges: PropTypes.func,
  nodebalancers: PropTypes.any,
  loading: PropTypes.any,
  errors: PropTypes.any,
  port: PropTypes.number,
  protocol: PropTypes.string,
  algorithm: PropTypes.string,
  stickiness: PropTypes.string,
  check: PropTypes.string,
  checkPassive: PropTypes.bool,
  checkInterval: PropTypes.number,
  checkTimeout: PropTypes.number,
  checkAttempts: PropTypes.number,
  submitText: PropTypes.string,
  nodebalancerConfigId: PropTypes.any,
};

ConfigForm.defaultProps = {
  port: 80,
  protocol: 'http',
  algorithm: 'roundrobin',
  stickiness: 'table',
  check: 'connection',
  checkPassive: true,
  checkInterval: 5,
  checkTimeout: 3,
  checkAttempts: 2,
};
