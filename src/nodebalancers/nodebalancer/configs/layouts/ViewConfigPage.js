import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { showModal } from '~/actions/modal';
import { setError } from '~/actions/errors';
import { Card, CardHeader } from 'linode-components/cards';
import { Button } from 'linode-components/buttons';
import { Table } from 'linode-components/tables';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { LinkCell, ButtonCell } from 'linode-components/tables/cells';
import { nodebalancers } from '~/api';
import { getObjectByLabelLazily, objectFromMapByLabel } from '~/api/util';
import { NodeModal } from '../components/NodeModal';

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

  constructor(props) {
    super(props);

    this.addNodeModal = this.addNodeModal.bind(this);
    this.editNodeModal = this.editNodeModal.bind(this);
    this.state = {
      errors: {},
      saving: false,
      loading: false,
    };
  }

  addNodeModal() {
    const { dispatch, nodebalancer } = this.props;

    dispatch(showModal('Add Node',
      <NodeModal
        dispatch={dispatch}
        confirmText="Create"
        configId={this.props.params.configId}
        nodebalancerId={nodebalancer.id}
      />
    ));
  }

  editNodeModal(node) {
    const { dispatch, nodebalancer } = this.props;

    dispatch(showModal(`Edit ${node.label}`,
      <NodeModal
        dispatch={dispatch}
        confirmText="Save"
        node={node}
        configId={this.props.params.configId}
        nodebalancerId={nodebalancer.id}
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
            <div className="col-sm-2 row-label">Port</div>
            <div className="col-sm-10">{config.port}</div>
          </div>
          <div className="row">
            <div className="col-sm-2 row-label">Protocol</div>
            <div className="col-sm-10">{config.protocol}</div>
          </div>
          <div className="row">
            <div className="col-sm-2 row-label">Algorithm</div>
            <div className="col-sm-10">{config.algorithm}</div>
          </div>
          <div className="row">
            <div className="col-sm-2 row-label">Session Stickiness</div>
            <div className="col-sm-10">{config.stickiness}</div>
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
                  { textKey: 'label', label: 'Label',
                    cellComponent: LinkCell,
                    hrefFn: function (node) {
                      // eslint-disable-next-line max-len
                      return `/nodebalancers/${nodebalancer.label}/configs/${config.id}/nodes/${node.id}`;
                    },
                  },
                  { dataKey: 'address', label: 'Address' },
                  { dataKey: 'weight', label: 'Weight' },
                  { dataKey: 'mode', label: 'Mode' },
                  { dataKey: 'status', label: 'Status' },
                  {
                    cellComponent: ButtonCell,
                    buttonClassName: 'btn-secondary',
                    onClick: (node) => this.editNodeModal(node),
                    text: 'Edit',
                  },
                ]}
                data={Object.values(nodes)}
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
  params: PropTypes.shape({
    configId: PropTypes.string.isRequired,
  }),
};

function select(state, props) {
  const { nbLabel, configId } = props.params;
  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);
  const config = objectFromMapByLabel(nodebalancer._configs.configs, +configId, 'id');
  return { config, nodebalancer };
}

export default connect(select)(ViewConfigPage);

