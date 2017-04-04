import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import ConfirmModalBody from '~/components/modals/ConfirmModalBody';
import { List, Table } from '~/components/tables';
import { MassEditControl } from '~/components/tables/controls';
import { ListHeader } from '~/components/tables/headers';
import { ListBody, ListGroup } from '~/components/tables/bodies';
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

  remove(zones) {
    const { dispatch } = this.props;
    dispatch(showModal('Confirm deletion',
      <ConfirmModalBody
        buttonText="Delete selected zones"
        onOk={() => {
          const zoneIds = zones.map((zone) => zone.id);

          zoneIds.forEach(function (id) {
            dispatch(dnszones.delete(id));
          });
          dispatch(toggleSelected(zoneIds));
          dispatch(hideModal());
        }}
        onCancel={() => dispatch(hideModal())}
      >
        Are you sure you want to delete selected Zones?
        This operation cannot be undone.
      </ConfirmModalBody>
    ));
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

  renderZones(zones) {
    const { dispatch, selected } = this.props;
    // TODO: add sort function in dns zones config definition
    const sortedZones = _.sortBy(Object.values(zones), ({ created }) => moment(created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedZones, ({ display_group: group }) => group), (_zones, _group) => {
        return {
          name: _group,
          data: _zones,
        };
      }), zoneGroup => zoneGroup.group);

    return (
      <List>
        <ListHeader>
          <div className="pull-sm-left">
            <MassEditControl
              data={sortedZones}
              dispatch={dispatch}
              massEditOptions={[
                { name: 'Delete', action: this.remove },
              ]}
              selectedMap={selected}
              toggleSelected={toggleSelected}
            />
          </div>
        </ListHeader>
        <ListBody>
          {groups.map((group, index) => {
            return (
              <ListGroup
                key={index}
                name={group.name}
              >
                <Table
                  columns={[
                    { cellComponent: CheckboxCell },
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
                  ]}
                  data={group.data}
                  selectedMap={selected}
                  disableHeader
                  onToggleSelect={(record) => {
                    dispatch(toggleSelected(record.id));
                  }}
                />
              </ListGroup>
            );
          })}
        </ListBody>
      </List>
    );
  }

  render() {
    const { dnszones, selected } = this.props;

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
          {Object.keys(dnszones.dnszones).length ? this.renderZones(dnszones.dnszones, selected) :
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
