import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Card from 'linode-components/dist/cards/Card';
import Form from 'linode-components/dist/forms/Form';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import Input from 'linode-components/dist/forms/Input';

import { setSource } from '~/actions';
import api from '~/api';
import { dispatchOrStoreErrors, objectFromMapByLabel } from '~/api/util';


export class NodeBalancerSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: props.nodebalancer.label,
      hostname: props.nodebalancer.hostname,
      connThrottle: props.nodebalancer.client_conn_throttle,
      errors: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, nodebalancer: { id, label: oldLabel } } = this.props;
    const { connThrottle, label } = this.state;

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.nodebalancers.put({ client_conn_throttle: +connThrottle, label }, id),
      () => label !== oldLabel ? push(`/nodebalancers/${label}/settings`) : () => { },
    ]));
  }

  render() {
    const { errors, loading, connThrottle, label, hostname } = this.state;

    return (
      <Card>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'NodeBalancer Settings' }}
        >
          <div className="row">
            <label className="col-sm-3 row-label">Hostname</label>
            <div className="col-sm-9">
              {hostname}
            </div>
          </div>
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="label" className="col-sm-3 col-form-label">Label</label>
            <div className="col-sm-9">
              <Input
                id="label"
                name="label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" name="client_conn_throttle">
            <label htmlFor="client_conn_throttle" className="col-sm-3 col-form-label">
              Client Connection Throttle
            </label>
            <div className="col-sm-9">
              <Input
                id="client_conn_throttle"
                name="client_conn_throttle"
                value={connThrottle}
                type="number"
                onChange={e => this.setState({ connThrottle: e.target.value })}
              />
              <FormGroupError errors={errors} name="client_conn_throttle" />
              <div><small className="text-muted">
                To help mitigate abuse, throttle connections from a single
                client IP to this number per second. 0 to disable.
              </small></div>
            </div>
          </FormGroup>
          <FormGroup className="row" name="submit">
            <div className="offset-sm-3 col-sm-9">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Settings saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

NodeBalancerSettings.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function select(state, { match: { params: { nbLabel } } }) {
  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(select)(NodeBalancerSettings);
