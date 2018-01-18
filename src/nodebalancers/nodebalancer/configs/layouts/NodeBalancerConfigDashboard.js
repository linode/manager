import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ListBody } from 'linode-components';
import { PrimaryButton } from 'linode-components';
import { Card, CardHeader } from 'linode-components';
import { List } from 'linode-components';
import { Table } from 'linode-components';
import { ButtonCell, LabelCell } from 'linode-components';
import { DeleteModalBody } from 'linode-components';

import api from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { PortalModal } from '~/components/modal';
import { NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS } from '~/constants';
import { hideModal } from '~/utilities';

import NodeModal from '../components/NodeModal';
import { ComponentPreload as Preload } from '~/decorators/Preload';


export class NodeBalancerConfigDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: null,
    };

    this.hideModal = hideModal.bind(this);
  }

  deleteNodeModal = (node) => {
    const { dispatch, nodebalancer, config } = this.props;
    const del = async () => {
      await dispatch(api.nodebalancers.configs.nodes.delete(nodebalancer.id, config.id, node.id));
      this.hideModal();
    };
    this.setState({
      modal: {
        title: 'Delete Node',
        onSubmit: del,
        onCancel: this.hideModal,
        items: [node.label],
        typeOfItem: 'Node',
        name: 'deleteNode',
      },
    });
  };

  nodeModal = (node) => {
    this.setState({
      modal: {
        name: 'nodeModal',
        title: node ? 'Edit Node' : 'Add a Node',
        node: node,
      },
    });
  }

  renderModal = () => {
    const { dispatch, nodebalancer, config } = this.props;
    if (!this.state.modal) {
      return null;
    }
    const { name, title, node } = this.state.modal;
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'nodeModal') &&
          <NodeModal
            dispatch={dispatch}
            configId={config.id}
            nodebalancerId={nodebalancer.id}
            title={title}
            node={node}
            close={this.hideModal}
          />
        }
        {(name === 'deleteNode') &&
          <DeleteModalBody
            {...this.state.modal}
          />
        }
      </PortalModal>
    );
  }

  renderNodes() {
    const { config } = this.props;
    const nodes = Object.values(config._nodes.nodes);

    const nav = (
      <PrimaryButton
        onClick={() => this.nodeModal(null)}
        buttonClass="btn-default"
        className="float-sm-right"
      >Add a Node</PrimaryButton>
    );
    const header = <CardHeader title="Nodes" nav={nav} />;

    return (
      <Card header={header}>
        {this.renderModal()}
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
                  onClick: (node) => this.nodeModal(node),
                  text: 'Edit',
                },
                {
                  cellComponent: ButtonCell,
                  headerClassName: 'ButtonColumn',
                  onClick: (node) => this.deleteNodeModal(node),
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
  const config = nodebalancer &&
    objectFromMapByLabel(nodebalancer._configs.configs, +configId, 'id');
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
