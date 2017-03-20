import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { nodebalancers } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import CreateHelper from '~/components/CreateHelper';
import { Table } from '~/components/tables';
import {
  ButtonCell,
  DatacenterCell,
  IPAddressCell,
  LinkCell,
} from '~/components/tables/cells';


export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(nodebalancers.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('NodeBalancers'));
  }

  deleteNodeBalancer = (zoneId) => {
    const { dispatch } = this.props;
    dispatch(showModal('Delete NodeBalancer', this.renderModal(zoneId)));
  }

  renderModal(zoneId) {
    const { dispatch } = this.props;
    return (
      <ConfirmModalBody
        buttonText="Delete"
        onOk={async () => {
          await dispatch(nodebalancers.delete(zoneId));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to <strong>permanently</strong> delete this NodeBalancer?
      </ConfirmModalBody>
    );
  }

  render() {
    const { nodebalancers } = this.props;
    // TODO: add sort function in config definition
    const data = Object.values(nodebalancers.nodebalancers);

    // TODO: add mass edit controls to nodebalancers
    const renderZones = (data) => (
      <Table
        columns={[
          {
            className: 'RowLabelCell',
            cellComponent: LinkCell,
            hrefFn: (nodebalancer) => { return `/nodebalancer/${nodebalancer.label}`; },
          },
          { cellComponent: IPAddressCell },
          { cellComponent: DatacenterCell },
          {
            cellComponent: ButtonCell,
            onClick: (nodebalancer) => { this.deleteNodeBalancer(nodebalancer.id); },
            text: 'Delete',
          },
        ]}
        data={data}
      />
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
          {data.length ? renderZones(data) :
            <CreateHelper label="zones" href="/nodebalancers/create" linkText="Add a zone" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancers: PropTypes.object,
};


function select(state) {
  return {
    nodebalancers: state.api.nodebalancers,
  };
}

export default connect(select)(IndexPage);
