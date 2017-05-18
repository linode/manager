import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell } from 'linode-components/tables/cells';
import { Select } from 'linode-components/forms';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { objectFromMapByLabel, getObjectByLabelLazily } from '~/api/util';
import { nodebalancerStats } from '~/api/nodebalancers';
import Region from '~/linodes/components/Region';
import LineGraph from '~/components/graphs/LineGraph';
import {
  NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS,
} from '~/constants';


function formatData(datasets, legends) {
  const x = datasets[0].map(([x]) => x);
  const ys = datasets.map(dataset => dataset.map(([, y]) => y));
  return LineGraph.formatData(x, ys, legends);
}

export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { nodebalancerLabel }) {
    let id;
    try {
      ({ id } = await dispatch(
        getObjectByLabelLazily('nodebalancers', nodebalancerLabel)
      ));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      await dispatch(setError(e));
    }

    try {
      await dispatch(nodebalancerStats([id]));
    } catch (e) {
      // Stats aren't available.
    }
  }

  constructor(props) {
    super(props);

    const stats = props.nodebalancer._stats;
    if (stats) {
      this.graphs = {
        connections: {
          title: 'Connections',
          yAxis: {
            label: 'Connections per second',
            format: p => p.toFixed(1),
          },
          data: formatData([stats.connections]),
        },
        traffic: {
          title: 'Traffic',
          yAxis: {
            label: 'Bits per second',
            format: r => `${r.toFixed(1)} bits/s`,
          },
          data: formatData([stats.traffic.in, stats.traffic.out],
                           ['In', 'Out']),
        },
      };
    }

    this.state = {
      source: 'connections',
      range: 'last1day',
      errors: {},
      saving: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { nodebalancer } = this.props;
    const { configs } = nodebalancer._configs;

    const newConfigs = Object.values(configs).map((config) => {
      return {
        ...config,
        protocol: config.protocol.toUpperCase(),
        algorithm: NODEBALANCER_CONFIG_ALGORITHMS.get(config.algorithm),
        stickiness: NODEBALANCER_CONFIG_STICKINESS.get(config.stickiness),
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
                  { dataKey: 'stickiness', label: 'Session Stickiness' },
                  { dataKey: 'statusString', label: 'Node Status' },
                  // TODO: make Delete button
                ]}
                data={newConfigs}
                selectedMap={{}}
              />
            </ListBody>
          </List>
        </Card>
        <Card header={<CardHeader title="Graphs" />}>
          {!this.graphs ? <p>No graphs are available.</p> : (
            <div>
              <div className="clearfix">
                <div className="float-sm-left">
                  <Select
                    value={this.state.source}
                    name="source"
                    onChange={this.onChange}
                  >
                    <option value="connections">Connections</option>
                    <option value="traffic">Traffic</option>
                  </Select>
                </div>
                <div className="float-sm-right">
                  <Select
                    value={this.state.range}
                    name="range"
                    onChange={this.onChange}
                    disabled
                  >
                    <option key={1} value="last1day">Last 24 hours</option>
                    <option key={2} value="last2day">Last 48 hours</option>
                    <option key={3} value="last7day">Last week</option>
                  </Select>
                </div>
              </div>
              <LineGraph {...this.graphs[this.state.source]} />
            </div>
          )}
        </Card>
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
