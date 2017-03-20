import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { Table } from '~/components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from '~/components/tables/cells';
import { dnszones } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { toggleSelected, toggleSelectAll } from '../actions';
import CreateHelper from '~/components/CreateHelper';
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
    dispatch(toggleSelected(zone));
  }

  deleteZone(zoneId) {
    const { dispatch } = this.props;
    dispatch(showModal('Delete DNS Zone', this.renderModal(zoneId)));
  }

  toggle(zone) {
    const { dispatch } = this.props;
    dispatch(toggleSelected(zone.id));
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
          dispatch(toggleSelectAll());
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        <span className="text-danger">WARNING!</span> This will permanently
        delete this DNS Zone. Confirm below to proceed.
      </ConfirmModalBody>
    );
  }

  renderActions(disabled) {
    const elements = [
      { _action: this.remove, name: 'Delete' },
    ].map(element => ({ ...element, action: this.massAction(element._action) }));

    return <Dropdown disabled={disabled} elements={elements} />;
  }

  renderZones(zones) {
    const { selected } = this.props;
    // TODO: add sort function in dns zones config definition
    const sortedZones = _.sortBy(Object.values(zones), ({ created }) => moment(created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedZones, ({ display_group: group }) => group), (_zones, _group) => {
        return {
          name: _group,
          columns: [
            {
              cellComponent: CheckboxCell,
              onChange: (record) => {
                this.toggle(record);
              },
            },
            {
              className: 'RowLabelCell',
              cellComponent: LinkCell,
              hrefFn: (zone) => `/dnsmanager/${zone.dnszone}`, textKey: 'dnszone',
            },
            { dataKey: 'type' },
            {
              cellComponent: ButtonCell,
              text: 'Delete',
              onClick: (zone) => { this.deleteZone(zone.id); },
            },
          ],
          data: _zones,
          disableHeader: true,
        };
      }), zoneGroup => zoneGroup.group);

    return (
      <div>
        {groups.map(function (group, index) {
          return (
            <div className="Group" key={index}>
              <div className="Group-label">{group.name}</div>
              <Table
                columns={group.columns}
                data={group.data}
                selectedMap={selected}
              />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { dnszones, selected, dispatch } = this.props;
    const zonesList = Object.values(selected);
    const allSelected = zonesList.length === Object.values(dnszones.dnszones).length &&
      zonesList.every((element) => element === true) &&
      zonesList.length !== 0;
    const noneSelected = zonesList.every((element) => element === false);
    const selectAllCheckbox = (<input
      type="checkbox"
      onChange={() => dispatch(toggleSelectAll())}
      checked={allSelected}
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
          {Object.values(dnszones.dnszones).length > 0 ?
            <div className="PrimaryPage-headerRow">
              <div className="input-group">
                <span className="input-group-addon">{selectAllCheckbox}</span>
                {this.renderActions(noneSelected)}
              </div>
            </div>
          : ''}
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
