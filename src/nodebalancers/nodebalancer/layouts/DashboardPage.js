import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';

import { objectFromMapByLabel } from '~/api/util';
import { setSource } from '~/actions/source';
import Region from '~/linodes/components/Region';


export class DashboardPage extends Component {
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
  }

  render() {
    const { nodebalancer } = this.props;
    const { configs } = nodebalancer._configs;

    const newConfigs = Object.values(configs).map((config) => {
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
      <div>
        <Card header={<CardHeader title="Summary" />}>
          <div className="row">
            <div className="col-sm-2 row-label">
              IP Addresses
            </div>
            <div className="col-sm-10">
              <ul className="list-unstyled">
                <li>{nodebalancer.ipv4}</li>
                <li className="text-muted">{nodebalancer.ipv6}</li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-2 row-label">
              Hostname
            </div>
            <div className="col-sm-10">
              {nodebalancer.hostname}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-2 row-label">
              Region
            </div>
            <div className="col-sm-10">
              <Region obj={nodebalancer} />
            </div>
          </div>
        </Card>
        <Card
          header={
            <CardHeader
              title="Configs"
              nav={
                <Link
                  to={`/nodebalancers/${nodebalancer.label}/configs/create`}
                  className="linode-add btn btn-default float-sm-right"
                >Add a Config</Link>
              }
            />
          }
        >
          <List>
            <ListBody>
              <Table
                className="Table--secondary"
                columns={[
                  { textKey: 'port', label: 'Port',
                    cellComponent: LinkCell,
                    hrefFn: function (config) {
                      return `/nodebalancers/${nodebalancer.label}/configs/${config.id}`;
                    },
                  },
                  { dataKey: 'protocol', label: 'Protocol' },
                  { dataKey: 'algorithm', label: 'Algorithm' },
                  { dataKey: 'stickiness', label: 'Session stickiness' },
                  { dataKey: 'check', label: 'Health check method' },
                  { dataKey: 'statusString', label: 'Node status' },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    buttonClassName: 'btn-secondary',
                    hrefFn: function (config) {
                      return `/nodebalancers/${nodebalancer.label}/configs/${config.id}/settings`;
                    },
                    text: 'Edit',
                  },
                ]}
                data={newConfigs}
                selectedMap={{}}
              />
            </ListBody>
          </List>
        </Card>
        <Card header={<CardHeader title="Graphs" />}>No graphs are available.</Card>
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(select)(DashboardPage);
