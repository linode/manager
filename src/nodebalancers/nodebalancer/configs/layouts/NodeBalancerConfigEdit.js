import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import ExternalLink from 'linode-components/dist/buttons/ExternalLink';
import Card from 'linode-components/dist/cards/Card';

import { setSource } from '~/actions/source';
import { objectFromMapByLabel } from '~/api/util';

import { ConfigForm } from '../../components';


export class NodeBalancerConfigEdit extends Component {
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
      <Card>
        <div>
          <p>
            {/* eslint-disable max-len */}
            Configure how your NodeBalancer listens for incoming traffic
            and connects to backend nodes. <ExternalLink to="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers#configuring-a-nodebalancer">Learn more.</ExternalLink>
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

NodeBalancerConfigEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  nodebalancer: PropTypes.object.isRequired,
};

function mapStateToProps(state, { match: { params: { nbLabel, configId } } }) {
  const id = parseInt(configId);

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, id, 'id');

  return { nodebalancer, config };
}

export default connect(mapStateToProps)(NodeBalancerConfigEdit);
