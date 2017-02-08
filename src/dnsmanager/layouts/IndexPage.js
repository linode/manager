import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { dnszones } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import CreateHelper from '~/components/CreateHelper';
import { Checkbox } from '~/components/form';
import { Button } from '~/components/buttons';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(dnszones.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor() {
    super();
    this.deleteZone = this.deleteZone.bind(this);
    this.state = { isSelected: { } };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  deleteZone(zoneId) {
    const { dispatch } = this.props;
    dispatch(showModal('Delete DNS Zone', this.renderModal(zoneId)));
  }

  renderModal(zoneId) {
    const { dispatch } = this.props;
    return (
      <ConfirmModalBody
        buttonText="Delete"
        onOk={async () => {
          await dispatch(dnszones.delete(zoneId));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <span className="text-danger">WARNING!</span> This will permanently
        delete this DNS Zone. Confirm below to proceed.
      </ConfirmModalBody>
    );
  }

  render() {
    const { dnszones } = this.props;
    const { isSelected } = this.state;

    const renderZones = () => (
      <table className="PrimaryTable">
        <tbody>
          {Object.values(dnszones.dnszones).map(z => (
            <tr
              key={z.id}
              className={`PrimaryTable-row ${isSelected[z.id] ? 'PrimaryTable-row--selected' : ''}`}
            >
              <td>
                <Checkbox
                  className="PrimaryTable-rowSelector"
                  checked={!!isSelected[z.id]}
                  onChange={() =>
                    this.setState({ isSelected: { ...isSelected, [z.id]: !isSelected[z.id] } })}
                />
                <Link
                  className="PrimaryTable-rowLabel"
                  to={`/dnsmanager/${z.dnszone}`}
                  title={z.id}
                >
                  {z.dnszone}
                </Link>
              </td>
              <td>{z.type} zone</td>
              <td className="text-sm-right">
                <Button onClick={() => this.deleteZone(z.id)}>Delete</Button>
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
            <h1 className="float-sm-left">DNS Manager</h1>
            <Link to="/dnsmanager/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a DNS Zone
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.dnszones.dnszones).length ? renderZones() :
            <CreateHelper label="zones" href="/dnsmanager/create" linkText="Add a zone" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  dnszones: PropTypes.object,
  selected: PropTypes.object,
};


function select(state) {
  return {
    dnszones: state.api.dnszones,
  };
}

export default connect(select)(IndexPage);
