import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import _ from 'lodash';

import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { Link } from '~/components/Link';
import { Card, CardHeader } from '~/components/cards';
import { List, Table } from '~/components/tables';
import { ListBody } from '~/components/tables/bodies';

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
      await dispatch(push('/404'));
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
      <List>
        <ListBody>
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
                buttonClassName: 'btn-secondary',
                hrefFn: function (config) {
                  return `/nodebalancers/${nbLabel}/configs/${config.id}/edit`;
                },
                text: 'Edit',
              },
            ]}
            data={newConfigs}
            selectedMap={{}}
            disableHeader
          />
        </ListBody>
      </List>
    );
  }

  render() {
    const { nbLabel, nodebalancer } = this.props;
    const { configs } = nodebalancer._configs;

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/nodebalancers">NodeBalancers</Link>
            <h1 title={nodebalancer.id}>{nbLabel}</h1>
          </div>
        </header>
        <div className="container">
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
                Status
              </div>
              <div className="col-sm-10">
                {NodebalancerStatusReadable[nodebalancer.status]}
              </div>
            </div>
            <div className="row">
              <div className="col-sm-2 row-label">
                Datacenter
              </div>
              <div className="col-sm-10">
                <Datacenter obj={nodebalancer} />
              </div>
            </div>
          </Card>
          <Card
            header={
              <CardHeader
                title="Configurations"
                nav={
                  <Link
                    to={`/nodebalancers/${nbLabel}/configs/create`}
                    className="linode-add btn btn-default float-sm-right"
                  >
                    Add a Configuration
                  </Link>
                }
              />
            }
          >
            {this.renderConfigs(Object.values(configs))}
          </Card>
          <Card header={<CardHeader title="Performance" />}>No stats are available.</Card>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  nbLabel: PropTypes.string,
  nodebalancer: PropTypes.any,
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
