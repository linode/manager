import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Link } from '~/components/Link';
import { Card } from '~/components/cards';
import { Table } from '~/components/tables';
import { LinkCell, ButtonCell } from '~/components/tables/cells';
import { NodebalancerStatusReadable } from '~/constants';
import Datacenter from '~/linodes/components/Datacenter';


export class IndexPage extends Component {
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

    this.state = {
      errors: {},
      saving: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Nodebalancers'));
  }

  renderConfigs(configs) {
    const { nbLabel } = this.props;

    const newConfigs = configs.map((config) => {
      return {
        ...config,
        protocol: config.protocol.toUpperCase(),
        algorithm: _.capitalize(config.algorithm),
        stickiness: _.capitalize(config.stickiness),
        check: _.capitalize(config.check),
        statusString: '0 up, 0 down',
      };
    });

    return (
      <Table
        className="Table--secondary"
        columns={[
          { textKey: 'port', label: 'Port',
            cellComponent: LinkCell,
            hrefFn: function (config) {
              return `/nodebalancers/${nbLabel}/configs/${config.id}`;
            },
          },
          { dataKey: 'protocol', label: 'Protocol' },
          { dataKey: 'algorithm', label: 'Algorithm' },
          { dataKey: 'stickiness', label: 'Session stickiness' },
          { dataKey: 'check', label: 'Health check method' },
          { dataKey: 'statusString', label: 'Node status' },
          {
            cellComponent: ButtonCell,
            hrefFn: function (config) {
              return `/nodebalancers/${nbLabel}/configs/${config.id}/edit`;
            },
            text: 'Edit',
          },
        ]}
        data={newConfigs}
      />
    );
  }

  render() {
    const { nbLabel, nodebalancer } = this.props;
    const { configs } = nodebalancer._configs;

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <h1 title={nodebalancer.id}>{nbLabel}</h1>
          </div>
        </header>
        <div className="container">
          <Card title="Summary">
            <div className="row">
              <div className="col-sm-1 row-label">
                IP Addresses
              </div>
              <div className="col-sm-11">
                <ul className="list-unstyled">
                  <li>{nodebalancer.ipv4}</li>
                  <li className="text-muted">{nodebalancer.ipv6}</li>
                </ul>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-1 row-label">
                Hostname
              </div>
              <div className="col-sm-11">
                {nodebalancer.hostname}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-1 row-label">
                Status
              </div>
              <div className="col-sm-11">
                {NodebalancerStatusReadable[nodebalancer.status]}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-1 row-label">
                Datacenter
              </div>
              <div className="col-sm-11">
                <Datacenter obj={nodebalancer} />
              </div>
            </div>
          </Card>
          <Card
            title="Configurations"
            nav={
              <Link
                to={`/nodebalancers/${nbLabel}/configs/create`}
                className="linode-add btn btn-default float-sm-right"
              >
                Add a Configuration
              </Link>
            }
          >
            {this.renderConfigs(Object.values(configs))}
          </Card>
          <Card title="Graphs">No data available</Card>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
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

export default connect(select)(IndexPage);

