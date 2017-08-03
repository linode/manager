import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ListBody } from 'linode-components/lists/bodies';
import { PrimaryButton } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { ButtonCell, LabelCell } from 'linode-components/tables/cells';
import { DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors, getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS } from '~/constants';

import NodeModal from '../components/NodeModal';


export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel, configId }) {
    const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
    await dispatch(nodebalancers.configs.one([id, configId]));
    await dispatch(nodebalancers.configs.nodes.all([id, configId]));
  }

  deleteNBConfigNode(nodebalancer, config, node) {
    const { dispatch } = this.props;
    const title = 'Delete Node';

    dispatch(showModal(title,
      <DeleteModalBody
        onSubmit={() => {
          const ids = [nodebalancer.id, config.id, node.id].filter(Boolean);

          return dispatch(dispatchOrStoreErrors.call(this, [
            () => nodebalancers.configs.nodes.delete(...ids),
            hideModal,
          ]));
        }}
        onCancel={() => dispatch(hideModal())}
        items={[node.label]}
        typeOfItem="Node"
      />
    ));
  }

  renderNodes() {
    const { dispatch, nodebalancer, config } = this.props;
    const nodes = Object.values(config._nodes.nodes);

    const nav = (
      <PrimaryButton
        onClick={() => NodeModal.trigger(dispatch, nodebalancer, config)}
        buttonClass="btn-default"
        className="float-sm-right"
      >Add a Node</PrimaryButton>
    );
    const header = <CardHeader title="Nodes" nav={nav} />;

    return (
      <Card header={header}>
        <List>
          <ListBody>
            <Table
              className="Table--secondary"
              columns={[
                {
                  cellComponent: LabelCell,
                  headerClassName: 'LabelColumn',
                  dataKey: 'label',
                  label: 'Label',
                  tooltipEnabled: true,
                },
                { dataKey: 'address', label: 'Address' },
                { dataKey: 'weight', label: 'Weight' },
                { dataKey: 'mode', label: 'Mode', formatFn: _.capitalize },
                { dataKey: 'status', label: 'Status', formatFn: _.capitalize },
                {
                  cellComponent: ButtonCell,
                  onClick: (node) => NodeModal.trigger(dispatch, nodebalancer, config, node),
                  text: 'Edit',
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
                  onClick: (node) => this.deleteNBConfigNode(nodebalancer, config, node),
                  text: 'Delete',
                },
              ]}
              data={nodes}
              selectedMap={{}}
              noDataMessage="You have no nodes."
            />
          </ListBody>
        </List>
      </Card>
    );
  }

  render() {
    const { config } = this.props;

    return (
      <div>
        <section>
          <Card header={<CardHeader title="Summary" />}>
            <div className="row">
              <div className="col-sm-3 row-label">Port</div>
              <div className="col-sm-9" id="port">{config.port}</div>
            </div>
            <div className="row">
              <div className="col-sm-3 row-label">Protocol</div>
              <div className="col-sm-9">{config.protocol.toUpperCase()}</div>
            </div>
            <div className="row">
              <div className="col-sm-3 row-label">Algorithm</div>
              <div className="col-sm-9">{NODEBALANCER_CONFIG_ALGORITHMS.get(config.algorithm)}</div>
            </div>
            <div className="row">
              <div className="col-sm-3 row-label">Session Stickiness</div>
              <div className="col-sm-9">
                {NODEBALANCER_CONFIG_STICKINESS.get(config.stickiness)}
              </div>
            </div>
          </Card>
        </section>
        {this.renderNodes()}
      </div>
    );
  }
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  nodebalancer: PropTypes.object.isRequired,
};

function select(state, props) {
  const { nbLabel, configId } = props.params;
  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, +configId, 'id');
  return { config, nodebalancer };
}

export default connect(select)(DashboardPage);
