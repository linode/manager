import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';
import { DeleteModalBody } from 'linode-components/modals';

import { setSource } from '~/actions/source';
import { showModal, hideModal } from '~/actions/modal';
import { objectFromMapByLabel, getObjectByLabelLazily } from '~/api/util';
import { nodebalancerStats } from '~/api/nodebalancers';
import { nodebalancers } from '~/api';
import {
  GraphGroup,
  makeConnectionsGraphMetadata,
  makeTrafficGraphMetadata,
} from '~/components/graphs/GraphGroup';
import Region from '~/linodes/components/Region';
import { dispatchOrStoreErrors } from '~/api/util';
import {
  NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS,
} from '~/constants';


export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel }) {
    const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));

    try {
      await dispatch(nodebalancerStats(id));
    } catch (e) {
      // Stats aren't available.
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  deleteNodeBalancerConfig(nodebalancer, config) {
    const { dispatch } = this.props;
    const title = 'Delete NodeBalancer Config';

    dispatch(showModal(title,
      <DeleteModalBody
        onSubmit={() => {
          const ids = [nodebalancer.id, config.id].filter(Boolean);

          return dispatch(dispatchOrStoreErrors.call(this, [
            () => nodebalancers.configs.delete(...ids),
            hideModal,
          ]));
        }}
        typeOfItem="NodeBalancer Config"
        onCancel={() => dispatch(hideModal())}
        items={[`port ${config.port}`]}
      />
    ));
  }

  renderGraphs() {
    const { timezone, nodebalancer: { _stats: stats } } = this.props;

    let body = <p>No graphs are available.</p>;
    if (stats) {
      const allGraphData = [
        makeConnectionsGraphMetadata(stats.connections),
        makeTrafficGraphMetadata(stats.traffic),
      ];
      body = <GraphGroup timezone={timezone} allGraphData={allGraphData} />;
    }

    return (
      <Card header={<CardHeader title="Graphs" />} className="graphs">
        {body}
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
                  <PrimaryButton
                    to={`/nodebalancers/${nodebalancer.label}/configs/create`}
                    buttonClass="btn-default"
                    className="float-sm-right"
                  >Add a Config</PrimaryButton>
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
