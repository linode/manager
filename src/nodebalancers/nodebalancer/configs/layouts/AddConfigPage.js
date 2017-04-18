import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { nodebalancers } from '~/api';

import { reduceErrors } from '~/errors';
import { Card, CardHeader } from 'linode-components/cards';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { ConfigForm } from '../../components/ConfigForm';

export class AddConfigPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
      await dispatch(nodebalancers.configs.all([id]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);
    this.saveChanges = this.saveChanges.bind(this);
    this.state = {
      loading: false,
      errors: {},
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async saveChanges(stateValues) {
    const { dispatch, nodebalancer } = this.props;

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
    } = stateValues;
    this.setState({ loading: true, errors: {} });
    const data = {
      port: parseInt(port),
      protocol,
      algorithm,
      stickiness,
      check,
      check_passive: Number(checkPassive),
      check_interval: checkInterval,
      check_timeout: checkTimeout,
      check_attempts: checkAttempts,
    };
    try {
      await dispatch(nodebalancers.configs.post(data, nodebalancer.id));
      this.setState({ loading: false });
      dispatch(push(`/nodebalancers/${nodebalancer.label}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { loading, errors } = this.state;

    return (
      <Card header={<CardHeader title="Add Configuration" />}>
        <div>
          <p>
            Configure how your NodeBalancer listens for incoming traffic
            and connects to backend nodes.
          </p>
        </div>
        <ConfigForm
          saveChanges={this.saveChanges}
          loading={loading}
          errors={errors}
          submitText="Add Configuration"
        />
      </Card>
    );
  }
}

AddConfigPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(select)(AddConfigPage);

