import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';

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

  renderGroup = ({ group, zones }) => {
    const { isSelected } = this.state;
    // TODO: sort in fetch call
    const sortedZones = _.sortBy(zones, ({ created }) => moment(created));

    const rowClass = (zone) =>
      `PrimaryTable-row ${isSelected[zone.id] ? ' PrimaryTable-row--selected' : ''}`;

    const ret = sortedZones.map(zone => (
      <tr key={zone.id} className={rowClass(zone)}>
        <td>
          <Checkbox
            className="PrimaryTable-rowSelector"
            checked={!!isSelected[zone.id]}
            onChange={() =>
              this.setState({ isSelected: { ...isSelected, [zone.id]: !isSelected[zone.id] } })}
          />
          <Link
            className="PrimaryTable-rowLabel"
            to={`/dnsmanager/${zone.dnszone}`}
            title={zone.id}
          >{zone.dnszone}</Link>
        </td>
        <td>{zone.type} zone</td>
        <td className="text-sm-right">
          <Button onClick={() => this.deleteZone(zone.id)}>Delete</Button>
        </td>
      </tr>
    ));

    if (group) {
      ret.splice(0, 0, (
        <tr className="PrimaryTable-row PrimaryTable-row--groupLabel">
          <td colSpan="3">{group}</td>
        </tr>
      ));
    }

    return ret;
  }

  renderZones(zones) {
    const groups = _.map(
      _.sortBy(
        _.map(
          _.groupBy(Object.values(zones), ({ display_group: group }) => group),
          (_zones, _group) => ({ group: _group, zones: _zones })
        ), zoneGroup => zoneGroup.group
      ), this.renderGroup);

    return (
      <table className="PrimaryTable">
        <tbody>
          {groups}
        </tbody>
      </table>
    );
  }


  render() {
    const { dnszones } = this.props;

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
          {Object.keys(dnszones.dnszones).length ? this.renderZones(dnszones.dnszones) :
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
