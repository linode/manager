import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';
import { Select } from 'linode-components/forms';
import { DeleteModalBody } from 'linode-components/modals';

import { setSource } from '~/actions/source';
import { showModal, hideModal } from '~/actions/modal';
import { objectFromMapByLabel, getObjectByLabelLazily } from '~/api/util';
import { nodebalancerStats } from '~/api/nodebalancers';
import { nodebalancers } from '~/api';
import Region from '~/linodes/components/Region';
import { dispatchOrStoreErrors } from '~/api/util';
import LineGraph from '~/components/graphs/LineGraph';
import {
  NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS,
} from '~/constants';


const CONNECTION_UNITS = [' connections', 'K connections', 'M connections'];
const NETWORK_UNITS = [' bits', 'K bits', 'M bits'];

function formatData(colors, datasets, legends) {
  const x = datasets[0].map(([x]) => x);
  const ys = datasets.map(dataset => dataset.map(([, y]) => y));
  return LineGraph.formatData(x, ys, colors, legends);
}

export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { nodebalancerLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nodebalancerLabel));

    try {
      await dispatch(nodebalancerStats([id]));
    } catch (e) {
      // Stats aren't available.
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      source: 'connections',
      units: 0,
    };

    this.componentWillReceiveProps = this.componentWillMount;
  }

  componentWillMount() {

  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  shouldComponentUpdate(newProps, newState) {
    // Prevents graph animation from happening multiple times for unchanged data.
    return !_.isEqual(this.props, newProps) || !_.isEqual(this.state, newState);
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  deleteNodeBalancerConfig(nodebalancer, config) {
    const { dispatch } = this.props;
    const title = 'Delete NodeBalancer Config';

    dispatch(showModal(title,
      <DeleteModalBody
        onOk={() => {
          const ids = [nodebalancer.id, config.id].filter(Boolean);

          return dispatch(dispatchOrStoreErrors.call(this, [
            () => nodebalancers.configs.delete(...ids),
            hideModal,
          ]));
        }}
        typeOfItem={title}
        onCancel={() => dispatch(hideModal())}
        items={[`port ${config.port}`]}
      />
    ));
  }

  renderUnitSelect() {
    const { units, source } = this.state;

    const _units = source === 'connections' ? CONNECTION_UNITS : NETWORK_UNITS;

    return (
      <div className="Menu-item">
        <label className="row-label">Units:</label>
        <Select
          value={units}
          name="units"
          onChange={this.onChange}
          options={_units.map((label, value) => ({ label, value }))}
        />
      </div>
    );
  }

  renderGraphs() {
    const { timezone, nodebalancer: { _stats: stats } } = this.props;
    const { units } = this.state;

    if (stats) {
      this.graphs = {
        connections: {
          title: 'Connections',
          yAxis: {
            label: `${CONNECTION_UNITS[units]} per second`,
            format: r => `${r.toFixed(1) / Math.pow(1000, units)}${CONNECTION_UNITS[units]}/s`,
          },
          data: formatData(['990066'], [stats.connections]),
          unit: `${CONNECTION_UNITS[units]}/s`,
        },
        traffic: {
          title: 'Traffic',
          yAxis: {
            label: `${NETWORK_UNITS[units]} per second`,
            format: r => `${r.toFixed(1) / Math.pow(1000, units)}${NETWORK_UNITS[units]}/s`,
          },
          data: formatData(['0033CC', '32CD32'],
                           [stats.traffic.in, stats.traffic.out],
                           ['In', 'Out']),
          unit: `${NETWORK_UNITS[units]}/s`,
        },
      };
    }

    return (
      <Card header={<CardHeader title="Graphs" />}>
        {!this.graphs ? <p>No graphs are available.</p> : (
          <div>
            <div className="Menu">
              <div className="Menu-item">
                <Select
                  value={this.state.source}
                  name="source"
                  onChange={this.onChange}
                >
                  <option value="connections">Connections</option>
                  <option value="traffic">Traffic</option>
                </Select>
              </div>
              {this.renderUnitSelect()}
              <div className="Menu-item Menu-item--right">Last 24 Hours</div>
            </div>
            <LineGraph
              timezone={timezone}
              {...this.graphs[this.state.source]}
            />
          </div>
        )}
      </Card>
    );
  }

  render() {
    const { nodebalancer } = this.props;
    const { configs } = nodebalancer._configs;

    const newConfigs = Object.values(configs).map((config) => {
      return {
        ...config,
        protocol: config.protocol.toUpperCase(),
        algorithm: NODEBALANCER_CONFIG_ALGORITHMS.get(config.algorithm),
        stickiness: NODEBALANCER_CONFIG_STICKINESS.get(config.stickiness),
        statusString: `${config.nodes_status.up} up, ${config.nodes_status.down} down`,
      };
    });

    return (
      <div>
        <section>
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
        </section>
        <section>
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
                      tooltipEnabled: true,
                    },
                    { dataKey: 'protocol', label: 'Protocol' },
                    { dataKey: 'algorithm', label: 'Algorithm' },
                    { dataKey: 'stickiness', label: 'Session Stickiness' },
                    { dataKey: 'statusString', label: 'Node Status' },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
                      onClick: (config) => {
                        this.deleteNodeBalancerConfig(nodebalancer, config);
                      },
                      text: 'Delete',
                    },
                  ]}
                  data={newConfigs}
                  noDataMessage="You have no configs."
                  selectedMap={{}}
                />
              </ListBody>
            </List>
          </Card>
        </section>
        {this.renderGraphs()}
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
  timezone: PropTypes.string,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;
  const { timezone } = state.api.profile;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer, timezone };
}

export default connect(select)(DashboardPage);
