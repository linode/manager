import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { objectFromMapByLabel } from '~/api/util';

import { ConfigForm } from '../components/ConfigForm';


export class EditConfigPage extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { config, dispatch, nodebalancer } = this.props;

    if (!config) {
      return dispatch(push(`/nodebalancers/${nodebalancer.label}`));
    }

    return (
      <Card header={<CardHeader title="Edit Config" />}>
        <div>
          <p>
            {/* eslint-disable max-len */}
            Configure how your NodeBalancer listens for incoming traffic
            and connects to backend nodes. <a href="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers#configuring-a-nodebalancer" target="_blank">Learn more.</a>
            {/* eslint-enable max-len */}
          </p>
        </div>
        <ConfigForm
          config={config}
          nodebalancer={nodebalancer}
          dispatch={dispatch}
        />
      </Card>
    );
  }
}

EditConfigPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  nodebalancer: PropTypes.object.isRequired,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;
  const id = parseInt(params.configId);

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, id, 'id');

  return { nodebalancer, config };
}

export default connect(select)(EditConfigPage);
