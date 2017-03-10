import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { nodebalancers } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { setError } from '~/actions/errors';
import { Link } from '~/components/Link';
import { Card } from '~/components/cards';
import SecondaryTable from '~/components/SecondaryTable';
import { Button } from '~/components/buttons';
import { NodebalancerStatusReadable } from '~/constants';
import { renderDatacenterStyle } from '~/linodes/components/Linode';
import { title } from '~/profile/integrations/components/AuthorizedApplication.js';


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
    this.renderDatacenterStyle = renderDatacenterStyle.bind(this);
    this._componentWillReceiveProps((state) => {
      this.state = {
        ...state,
        errors: {},
        saving: false,
      };
    })(props);
    this.componentWillReceiveProps = this._componentWillReceiveProps();
  }

  _componentWillReceiveProps(_setState) {
    const setState = _setState || this.setState.bind(this);
    return (nextProps) => {
      const { nodebalancers, params } = nextProps;
      const nodebalancer = Object.values(nodebalancers.nodebalancers).filter(
        n => n.label === params.nbLabel)[0];
      setState({ nodebalancer });
    };
  }

  renderConfigs(configs) {
    const labels = [
      'Port',
      'Protocol',
      'Algorithm',
      'Session stickiness',
      'Health check method',
      'Node status',
      '',
    ];
    const keys = [
      'port',
      'protocol',
      'algorithm',
      'stickiness',
      'check',
      'statusString',
      'edit',
    ];
    const newConfigs = configs.map((config) => {
      return {
        ...config,
        protocol: config.protocol.toUpperCase(),
        algorithm: title(config.algorithm),
        stickiness: title(config.stickiness),
        check: title(config.check),
        statusString: '0 up, 0 down',
        edit: <Button>Edit</Button>,
      };
    });

    return (
      <SecondaryTable
        labels={labels}
        keys={keys}
        rows={newConfigs}
      />
    );
  }

  render() {
    const { nbLabel } = this.props.params;
    const { nodebalancer } = this.state;
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
                {this.renderDatacenterStyle(nodebalancer)}
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
  nodebalancers: PropTypes.object,
  params: PropTypes.any,
};

function select(state) {
  return {
    nodebalancers: state.api.nodebalancers,
  };
}
export default connect(select)(IndexPage);

