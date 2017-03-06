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
import { Checkbox } from '~/components/form';
import { Button } from '~/components/buttons';
import { renderDatacenterStyle } from '~/linodes/components/Linode';

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

  constructor() {
    super();
    this.state = { isSelected: { } };
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
    const { isSelected } = this.state;

    const renderZones = () => (
      <table className="PrimaryTable">
        <tbody>
          {Object.values(nodebalancers.nodebalancers).map(n => (
            <tr
              key={n.id}
              className={`PrimaryTable-row ${isSelected[n.id] ? 'PrimaryTable-row--selected' : ''}`}
            >
              <td>
                <Checkbox
                  className="PrimaryTable-rowSelector"
                  checked={!!isSelected[n.id]}
                  onChange={() =>
                    this.setState({ isSelected: { ...isSelected, [n.id]: !isSelected[n.id] } })}
                />
                <Link
                  className="PrimaryTable-rowLabel"
                  to={`/nodebalancers/${n.label}`}
                  title={n.id}
                >
                  {n.label}
                </Link>
              </td>
              <td>
                {n.ipv4}
                {/* TODO: drop || when ipv6 actually exists, or look up correctly */}
                <div className="text-muted">{(n.ipv6 || '').split('/')[0]}</div>
              </td>
              <td>{renderDatacenterStyle(n)}</td>
              <td className="text-sm-right">
                <Button onClick={() => this.deleteNodeBalancer(n.id)}>Delete</Button>
              </td>
            </tr>
           ))}
        </tbody>
      </table>
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
          {Object.keys(this.props.nodebalancers.nodebalancers).length ? renderZones() :
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
