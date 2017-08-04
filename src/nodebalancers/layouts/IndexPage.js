import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { DeleteModalBody } from 'linode-components/modals';
import CreateHelper from '~/components/CreateHelper';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { ListBody } from 'linode-components/lists/bodies';
import { ListHeader } from 'linode-components/lists/headers';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';
import {
  RegionCell,
  IPAddressCell,
} from '~/components/tables/cells';
import { MassEditControl } from 'linode-components/lists/controls';

import { setAnalytics, setSource, setTitle } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { nodebalancers as api } from '~/api';
import { transform } from '~/api/util';

import { AddNodeBalancer } from '../components';


const OBJECT_TYPE = 'nodebalancers';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.all());
  }

  constructor(props) {
    super(props);

    this.deleteNodeBalancers = this.deleteNodeBalancers.bind(this);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('NodeBalancers'));
    dispatch(setAnalytics(['nodebalancers']));
  }

  deleteNodeBalancers(nodebalancers) {
    const { dispatch } = this.props;
    const nodebalancersArr = Array.isArray(nodebalancers) ? nodebalancers : [nodebalancers];
    const title = 'Delete NodeBalancer(s)';

    dispatch(showModal(title,
      <DeleteModalBody
        onSubmit={async () => {
          const ids = nodebalancersArr.map(function (nodebalancer) { return nodebalancer.id; });

          await Promise.all(ids.map(id => dispatch(api.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
        items={nodebalancersArr.map(n => n.label)}
        typeOfItem="NodeBalancers"
      />
    ));
  }

  render() {
    const { dispatch, nodebalancers, selectedMap } = this.props;
    const { filter } = this.state;

    const { sorted } = transform(nodebalancers.nodebalancers, {
      filterBy: filter,
    });

    const renderNodeBalancers = () => (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sorted}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteNodeBalancers },
              ] }]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: LinkCell,
                hrefFn: (nodebalancer) => { return `/nodebalancers/${nodebalancer.label}`; },
                tooltipEnabled: true,
              },
              { cellComponent: IPAddressCell, headerClassName: 'IPAddressColumn' },
              { cellComponent: RegionCell },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                onClick: (nodebalancer) => { this.deleteNodeBalancers(nodebalancer); },
                text: 'Delete',
              },
            ]}
            noDataMessage={"No NodeBalancers found."}
            data={sorted}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
          />
        </ListBody>
      </List>
    );

    const addNodeBalancer = () => AddNodeBalancer.trigger(dispatch);

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">NodeBalancers</h1>
            <PrimaryButton onClick={addNodeBalancer} className="float-right">
              Add a NodeBalancer
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.values(nodebalancers.nodebalancers).length ? renderNodeBalancers() : (
            <CreateHelper
              label="NodeBalancers"
              linkText="Add a NodeBalancer"
              onClick={addNodeBalancer}
            />
          )}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancers: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    nodebalancers: state.api.nodebalancers,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
