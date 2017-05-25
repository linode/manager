import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { ListBody } from 'linode-components/lists/bodies';
import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { ButtonCell } from 'linode-components/tables/cells';
import { DeleteModalBody } from 'linode-components/modals';

import { showModal, hideModal } from '~/actions/modal';
import { setError } from '~/actions/errors';
import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { NODEBALANCER_CONFIG_ALGORITHMS, NODEBALANCER_CONFIG_STICKINESS } from '~/constants';

import { NodeModal } from '../components/NodeModal';
import { dispatchOrStoreErrors } from '~/components/forms';


export class ViewConfigPage extends Component {
  static async preload({ dispatch, getState }, { nbLabel, configId }) {
    try {
      const { id } = await dispatch(getObjectByLabelLazily('nodebalancers', nbLabel));
      await dispatch(nodebalancers.configs.one([id, configId]));
      await dispatch(nodebalancers.configs.nodes.all([id, configId]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor() {
    super();

    this.addNodeModal = this.addNodeModal.bind(this);
    this.editNodeModal = this.editNodeModal.bind(this);
    this.state = {
      errors: {},
      saving: false,
      loading: false,
    };
  }

  addNodeModal() {
    const { dispatch, nodebalancer, config } = this.props;

    dispatch(showModal('Add Node',
      <NodeModal
        dispatch={dispatch}
        confirmText="Create"
        configId={config.id}
        nodebalancerId={nodebalancer.id}
      />
    ));
  }

  editNodeModal(node) {
    const { dispatch, nodebalancer, config } = this.props;

    dispatch(showModal('Edit Node',
      <NodeModal
        dispatch={dispatch}
        confirmText="Save"
        node={node}
        configId={config.id}
        nodebalancerId={nodebalancer.id}
      />
    ));
  }

  deleteNBConfigNode(nodebalancer, config, node) {
    const { dispatch } = this.props;

    dispatch(showModal('Delete Node',
      <DeleteModalBody
        onOk={() => {
          const ids = [nodebalancer.id, config.id, node.id].filter(Boolean);

          return dispatch(dispatchOrStoreErrors.call(this, [
            () => nodebalancers.configs.nodes.delete(...ids),
            hideModal,
          ]));
        }}
        onCancel={() => dispatch(hideModal())}
        items={[node.label]}
      />
    ));
  }

  render() {
    const { nodebalancer, config } = this.props;
    const nodes = Object.values(config._nodes.nodes);

    return (
      <div>
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
            <div className="col-sm-9">{NODEBALANCER_CONFIG_STICKINESS.get(config.stickiness)}</div>
          </div>
        </Card>
        <Card
          title="Nodes"
          header={
            <CardHeader
              title="Nodes"
              nav={
                <Button
                  onClick={this.addNodeModal}
                  className="linode-add btn btn-default float-sm-right"
                >Add a Node</Button>
              }
            />
          }
        >
          <List>
            <ListBody>
              <Table
                className="Table--secondary"
                columns={[
                  { dataKey: 'label', label: 'Label' },
                  { dataKey: 'address', label: 'Address' },
                  { dataKey: 'weight', label: 'Weight' },
                  { dataKey: 'mode', label: 'Mode', formatFn: _.capitalize },
                  { dataKey: 'status', label: 'Status', formatFn: _.capitalize },
                  {
                    cellComponent: ButtonCell,
                    onClick: (node) => this.editNodeModal(node),
                    text: 'Edit',
                  },
                  {
                    cellComponent: ButtonCell,
                    headerClassName: 'ButtonColumn',
                    onClick: (node) => {
                      this.deleteNBConfigNode(nodebalancer, config, node);
                    },
                    text: 'Delete',
                  },
                ]}
                data={nodes}
                selectedMap={{}}
              />
            </ListBody>
          </List>
        </Card>
      </div>
    );
  }
}

ViewConfigPage.propTypes = {
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

export default connect(select)(ViewConfigPage);

