import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { nodebalancers } from '~/api';

import { reduceErrors } from '~/errors';
import { Card, CardHeader } from '~/components/cards';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { ConfigForm } from '../components/ConfigForm';

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

    dispatch(setTitle('Nodebalancers'));
  }

  async saveChanges(stateValues) {
    const { dispatch, nbLabel, nodebalancer } = this.props;

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
      dispatch(push(`/nodebalancers/${nbLabel}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { nbLabel } = this.props;
    const { loading, errors } = this.state;

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1>
              {nbLabel}
            </h1>
          </div>
        </header>
        <div className="container">
          <Card header={<CardHeader title="Add Configuration" />}>
            <div>
              <p>
                Configure how your NodeBalancer listens for incoming traffic
                and connects to backend nodes. <a href="#">Learn more.</a>
              </p>
            </div>
            <ConfigForm
              saveChanges={this.saveChanges}
              loading={loading}
              errors={errors}
              submitText="Add Configuration"
            />
          </Card>
        </div>
      </div>
    );
  }
}

AddConfigPage.propTypes = {
  dispatch: PropTypes.func,
  nbLabel: PropTypes.string,
  nodebalancer: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return {
    nbLabel: nbLabel,
    nodebalancer: nodebalancer,
  };
}

export default connect(select)(AddConfigPage);

