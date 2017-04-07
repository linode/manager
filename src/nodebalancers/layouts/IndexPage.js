import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import { default as toggleSelected } from '~/actions/select';
import { showModal, hideModal } from '~/actions/modal';
import { nodebalancers as api } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import CreateHelper from '~/components/CreateHelper';
import { List, Table } from '~/components/tables';
import { ListBody } from '~/components/tables/bodies';
import { ListHeader } from '~/components/tables/headers';
import {
  ButtonCell,
  CheckboxCell,
  DatacenterCell,
  IPAddressCell,
  LinkCell,
} from '~/components/tables/cells';
import { MassEditControl } from '~/components/tables/controls';

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

    dispatch(setTitle('Nodebalancers'));
  }

  deleteNodeBalancers(nodebalancers) {
    const { dispatch } = this.props;
    const nodebalancersArr = Array.isArray(nodebalancers) ? nodebalancers : [nodebalancers];

    dispatch(showModal('Delete NodeBalancer',
      <ConfirmModalBody
        buttonText="Delete"
        onOk={async () => {
          const ids = nodebalancersArr.map(function (nodebalancer) { return nodebalancer.id; });

          await dispatch(api.delete(ids));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to <strong>permanently</strong> delete this NodeBalancer?
      </ConfirmModalBody>
    ));
  }

  render() {
    const { dispatch, nodebalancers, selectedMap } = this.props;
    // TODO: add sort function in config definition
    const data = Object.values(nodebalancers.nodebalancers);

    // TODO: add mass edit controls to nodebalancers
    const renderNodebalancers = (data) => (
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
              objType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              { cellComponent: CheckboxCell },
              {
                className: 'RowLabelCell',
                cellComponent: LinkCell,
                hrefFn: (nodebalancer) => { return `/nodebalancers/${nodebalancer.label}`; },
              },
              { cellComponent: IPAddressCell },
              { cellComponent: DatacenterCell },
              {
                cellComponent: ButtonCell,
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
          {data.length ? renderNodebalancers(data) : (
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
