import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { setSource } from '~/actions/source';
import { objectFromMapByLabel } from '~/api/util';

import { ConfigForm } from '../components';


export class AddConfigPage extends Component {
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
          and connects to backend nodes. <a href="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers#configuring-a-nodebalancer" target="_blank">Learn more.</a>
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

