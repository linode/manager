import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Card from 'linode-components/dist/cards/Card';
import CardHeader from 'linode-components/dist/cards/CardHeader';
import List from 'linode-components/dist/lists/List';
import Table from 'linode-components/dist/tables/Table';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';
import LabelCell from 'linode-components/dist/tables/cells/LabelCell';
import DeleteModalBody from 'linode-components/dist/modals/DeleteModalBody';

import { showModal, hideModal } from '~/actions/modal';
import api from '~/api';
import { dispatchOrStoreErrors, getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS } from '~/constants';

import NodeModal from '../components/NodeModal';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class NodeBalancerConfigDashboard extends Component {
  deleteNBConfigNode(nodebalancer, config, node) {
    const { dispatch } = this.props;
    const title = 'Delete Node';

    dispatch(showModal(title,
      <DeleteModalBody
        onSubmit={() => {
          const ids = [nodebalancer.id, config.id, node.id].filter(Boolean);

          return dispatch(dispatchOrStoreErrors.call(this, [
            () => api.nodebalancers.configs.nodes.delete(...ids),
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
                  headerClassName: 'NodeBalancerLabelColumn',
                  dataKey: 'label',
                  label: 'Label',
                  tooltipEnabled: true,
                },
                { dataKey: 'address', label: 'Address', headerClassName: 'AddressColumn' },
                { dataKey: 'weight', label: 'Weight', headerClassName: 'WeightColumn' },
                {
                  dataKey: 'mode',
                  label: 'Mode',
                  formatFn: capitalize,
                  headerClassName: 'ModeColumn',
                },
                {
                  dataKey: 'status',
                  label: 'Status',
                  formatFn: capitalize,
                  headerClassName: 'ModeColumn',
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
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

NodeBalancerConfigDashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  nodebalancer: PropTypes.object.isRequired,
};

const mapStateToProps = (state, { match: { params: { nbLabel, configId } } }) => {
  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, +configId, 'id');
  return { config, nodebalancer };
};

const preloadRequest = async (dispatch, { match: { params: { nbLabel, configId } } }) => {
  const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
  await Promise.all([
    api.nodebalancers.configs.one([id, configId]),
    api.nodebalancers.configs.nodes.all([id, configId]),
  ].map(dispatch));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(NodeBalancerConfigDashboard);
