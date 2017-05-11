import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import { default as toggleSelected } from '~/actions/select';
import { showModal, hideModal } from '~/actions/modal';
import { nodebalancers as api } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
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

const OBJECT_TYPE = 'nodebalancers';


export class IndexPage extends Component {

  static async preload({ dispatch }) {
    try {
      await dispatch(api.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.deleteNodeBalancers = this.deleteNodeBalancers.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('NodeBalancers'));
  }

  deleteNodeBalancers(nodebalancers) {
    const { dispatch } = this.props;
    const nodebalancersArr = Array.isArray(nodebalancers) ? nodebalancers : [nodebalancers];

    dispatch(showModal('Delete NodeBalancer(s)',
      <DeleteModalBody
        onOk={async () => {
          const ids = nodebalancersArr.map(function (nodebalancer) { return nodebalancer.id; });

          await dispatch(api.delete(ids));
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
    // TODO: add sort function in config definition
    const data = Object.values(nodebalancers.nodebalancers);

    // TODO: add mass edit controls to nodebalancers
    const renderNodeBalancers = (data) => (
      <List>
        <ListHeader>
          <div className="pull-sm-left">
            <MassEditControl
              data={data}
              dispatch={dispatch}
              massEditOptions={[
                { name: 'Delete', action: this.deleteNodeBalancers },
              ]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                className: 'RowLabelCell',
                cellComponent: LinkCell,
                hrefFn: (nodebalancer) => { return `/nodebalancers/${nodebalancer.label}`; },
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
            data={data}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(record) => {
              dispatch(toggleSelected(OBJECT_TYPE, record.id));
            }}
          />
        </ListBody>
      </List>
    );

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">NodeBalancers</h1>
            <Link to="/nodebalancers/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a NodeBalancer
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {data.length ? renderNodeBalancers(data) : (
            <CreateHelper
              label="NodeBalancers"
              href="/nodebalancers/create"
              linkText="Add a NodeBalancer"
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
