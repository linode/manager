import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import Breadcrumbs from '~/components/Breadcrumbs';
import { Link } from 'react-router';
import { Card, CardHeader } from 'linode-components/cards';
import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';

export class ViewConfigPage extends Component {
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

  constructor() {
    super();

    this.state = {
      errors: {},
      saving: false,
    };
  }

  render() {
    const { nodebalancer, config } = this.props;

    const crumbs = [
      { to: '/nodebalancers', label: 'NodeBalancers' },
      { to: `/nodebalancers/${nodebalancer.label}`, label: nodebalancer.label },
    ];

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Breadcrumbs crumbs={crumbs} />
            <h1 title={config.id}>Port {config.port}</h1>
          </div>
        </header>
        <div className="container">
          <Card header={<CardHeader title="Summary" />}>
            <div className="row">
              <div className="col-sm-2 row-label">Port</div>
              <div className="col-sm-10">{config.port}</div>
            </div>
            <div className="row">
              <div className="col-sm-2 row-label">Protocol</div>
              <div className="col-sm-10">{config.protocol}</div>
            </div>
            <div className="row">
              <div className="col-sm-2 row-label">Algorithm</div>
              <div className="col-sm-10">{config.algorithm}</div>
            </div>
            <div className="row">
              <div className="col-sm-2 row-label">Session Stickiness</div>
              <div className="col-sm-10">{config.stickiness}</div>
            </div>
          </Card>
          <Card title="Nodes"
            header={
              <CardHeader
                title="Nodes"
                nav={
                  <Link
                    to={`/nodebalancers/${nodebalancer.label}/configurations/${config.id}/create`}
                    className="linode-add btn btn-default float-sm-right"
                  >Add a Node</Link>
                }
              />
            }
          />
        </div>
      </div>
    );
  }
}

ViewConfigPage.propTypes = {
  config: PropTypes.object.isRequired,
  nodebalancer: PropTypes.object.isRequired,
};

function select(state, props) {
  const { nbLabel, configId } = props.params;
  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, +configId, 'id');
  return { config, nodebalancer };
}

export default connect(select)(ViewConfigPage);

