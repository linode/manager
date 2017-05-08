import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, SubmitButton, Input } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { nodebalancers } from '~/api';
import { objectFromMapByLabel } from '~/api/util';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';


export class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: props.nodebalancer.label,
      hostname: props.nodebalancer.hostname,
      connThrottle: props.nodebalancer.client_conn_throttle,
      errors: {},
      saving: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = async () => {
    const { dispatch, nodebalancer: { id, label: oldLabel } } = this.props;
    const { connThrottle, label } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => nodebalancers.put({ client_conn_throttle: +connThrottle, label }, id),
        () => label !== oldLabel ? push(`/nodebalancers/${label}/settings`) : () => {},
      ],
    ]));
  }

  render() {
    const { errors, loading, connThrottle, label, hostname } = this.state;
    console.log(this.state);

    return (
      <Card header={<CardHeader title="Display" />}>
        <Form onSubmit={this.onSubmit}>
          <div className="row">
            <label className="col-sm-3 row-label">Hostname</label>
            <div className="col-sm-8">
              <span>{hostname}</span>
            </div>
          </div>
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="label" className="col-sm-3 col-form-label">Label</label>
            <div className="col-sm-8">
              <Input
                id="label"
                name="label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="connThrottle" className="col-sm-3 col-form-label">Client Connection Throttle</label>
            <div className="col-sm-8">
              <Input
                id="connThrottle"
                name="connThrottle"
                value={connThrottle}
                onChange={e => this.setState({ connThrottle: e.target.value })}
              />
              <div><small className="text-muted">
                To help mitigate abuse, throttle connections from a single
                client IP to this number per second. 0 to disable.
              </small></div>
              <FormGroupError errors={errors} name="connThrottle" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-3 col-sm-8">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Settings saved." />
            </div>
          </FormGroup>
        </Form>
      </Card>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(select)(SettingsPage);
