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
import { toggleSelected, toggleSelectAll } from '../actions';
import CreateHelper from '~/components/CreateHelper';
import { Checkbox } from '~/components/form';
import { Button } from '~/components/buttons';
import Dropdown from '~/components/Dropdown';

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
    this.remove = this.remove.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  remove(zone) {
    const { dispatch } = this.props;
    dispatch(dnszones.delete(zone));
  }

  deleteZone(zoneId) {
    const { dispatch } = this.props;
    dispatch(showModal('Delete DNS Zone', this.renderModal(zoneId)));
  }


  doToSelected() {
    const { selected } = this.props;
    Object.keys(selected).map(id => {
      if (selected[id] === true) {
        this.remove(id);
      }
    });
  }

  massAction(action) {
    return () => {
      if (action !== this.remove) {
        this.doToSelected(action);
        return;
      }

      const { dispatch } = this.props;

      dispatch(showModal('Confirm deletion',
        <ConfirmModalBody
          buttonText="Delete selected zones"
          onOk={() => {
            this.doToSelected(action);
            dispatch(hideModal());
          }}
          onCancel={() => dispatch(hideModal())}
        >
          Are you sure you want to delete selected Zones?
          This operation cannot be undone.
        </ConfirmModalBody>
      ));
    };
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
    const { dispatch, selected } = this.props;
    // TODO: sort in fetch call
    const sortedZones = _.sortBy(zones, ({ created }) => moment(created));

    const rowClass = (zone) =>
      `PrimaryTable-row ${selected[zone.id] ? ' PrimaryTable-row--selected' : ''}`;

    const ret = sortedZones.map(zone => (
      <tr key={zone.id} className={rowClass(zone)}>
        <td>
          <Checkbox
            className="PrimaryTable-rowSelector"
            checked={!!selected[zone.id]}
            onChange={() =>
              dispatch(toggleSelected(zone.id))}
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

  renderActions() {
    const elements = [
      { _action: this.remove, name: 'Delete' },
    ].map(element => ({ ...element, action: this.massAction(element._action) }));

    return <Dropdown elements={elements} />;
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
    const { dnszones, selected, dispatch } = this.props;
    const zonesList = Object.values(selected);
    const allSelected = zonesList.length === dnszones.totalResults &&
      zonesList.every((element) => element === true) &&
      zonesList.length !== 0;
    const selectAllCheckbox = (<input
      type="checkbox"
      onChange={() => dispatch(toggleSelectAll())} checked={allSelected}
    />);

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
          <div className="PrimaryPage-headerRow">
            <div className="input-group">
              <span className="input-group-addon">{selectAllCheckbox}</span>
              {this.renderActions()}
            </div>
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
    selected: state.dnsmanager.index.selected,
  };
}

export default connect(select)(IndexPage);
