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

export class EditConfigPage extends Component {
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
    const { config, dispatch, nbLabel, nodebalancer } = this.props;

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
      await dispatch(nodebalancers.configs.put(data, nodebalancer.id, config.id));
      this.setState({ loading: false });
      await dispatch(push(`/nodebalancers/${nbLabel}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  render() {
    const { config, nbLabel } = this.props;
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
          <Card header={<CardHeader title="Edit Configuration" />}>
            <div>
              <p>
                {/* eslint-disable max-len */}
                Configure how your NodeBalancer listens for incoming traffic
                and connects to backend nodes. <a href="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers#configuring-a-nodebalancer" target="_blank">Learn more.</a>
                {/* eslint-enable max-len */}
              </p>
            </div>
            <ConfigForm
              saveChanges={this.saveChanges}
              loading={loading}
              errors={errors}
              submitText="Edit Configuration"
              port={config.port}
              protocol={config.protocol}
              algorithm={config.algorithm}
              stickiness={config.stickiness}
              check={config.check}
              checkPassive={!!config.check_passive}
              checkInterval={config.check_interval}
              checkTimeout={config.check_timeout}
              checkAttempts={config.check_attempts}
              nodebalancerConfigId={config.id}
            />
          </Card>
        </div>
      </div>
    );
  }
}

EditConfigPage.propTypes = {
  dispatch: PropTypes.func,
  config: PropTypes.object,
  nbLabel: PropTypes.string,
  nodebalancer: PropTypes.object,
  port: PropTypes.number,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;
  const id = parseInt(params.port);

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, id, 'id');

  return {
    nbLabel: nbLabel,
    id: id,
    nodebalancer: nodebalancer,
    config: config,
  };
}
export default connect(select)(EditConfigPage);
