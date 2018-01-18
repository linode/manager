import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { ExternalLink } from 'linode-components';
import { Card, CardHeader } from 'linode-components';

import { setSource } from '~/actions/source';
import { objectFromMapByLabel } from '~/api/util';

import { ConfigForm } from '../components';


export class NodeBalancerConfigAdd extends Component {
  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  render() {
    const { dispatch, nodebalancer } = this.props;

    return (
      <Card header={<CardHeader title="Add Config" />}>
        <p>
          {/* eslint-disable max-len */}
          Configure how your NodeBalancer listens for incoming traffic
          and connects to backend nodes. <ExternalLink to="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers#configuring-a-nodebalancer">Learn more.</ExternalLink>
          {/* eslint-enable max-len */}
        </p>
        <ConfigForm
          dispatch={dispatch}
          nodebalancer={nodebalancer}
          submitText="Add Config"
          submitDisabledText="Adding Config"
        />
      </Card>
    );
  }
}

NodeBalancerConfigAdd.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const params = ownProps.match.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(mapStateToProps)(NodeBalancerConfigAdd);

