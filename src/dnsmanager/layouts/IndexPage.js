import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import { List, Table } from '~/components/tables';
import { MassEditControl } from '~/components/tables/controls';
import { ListHeader } from '~/components/tables/headers';
import { ListBody, ListGroup } from '~/components/tables/bodies';
import DeleteModalBody from '~/components/modals/DeleteModalBody';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from '~/components/tables/cells';
import { dnszones as apiDnszones } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { toggleSelected, toggleSelectAll } from '../actions';
import CreateHelper from '~/components/CreateHelper';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(apiDnszones.all());
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
    const { dispatch, selected, dnszones } = this.props;
    dispatch(showModal('Confirm deletion',
      <DeleteModalBody
        buttonText="Delete selected zones"
        onOk={() => {
          const zoneIds = zones.map((zone) => zone.id);

          zoneIds.forEach(function (id) {
            dispatch(apiDnszones.delete(id));
          });
          dispatch(toggleSelected(zoneIds));
          dispatch(hideModal());
        }}
        items={dnszones.dnszones}
        selectedItems={Object.keys(selected)}
        typeOfItem="zones"
        label="dnszone"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  deleteZone(zoneId) {
    const { dispatch } = this.props;
    dispatch(showModal('Delete DNS Zone', this.renderModal(zoneId)));
  }

  renderModal(zoneId) {
    const { dispatch, dnszones: theseZones } = this.props;
    return (
      <DeleteModalBody
        buttonText="Delete selected zones"
        onOk={async () => {
          await dispatch(apiDnszones.delete(zoneId));
          dispatch(toggleSelectAll());
          dispatch(hideModal());
        }}
        items={theseZones.dnszones}
        selectedItems={zoneId}
        typeOfItem="zones"
        label="dnszone"
        onCancel={() => dispatch(hideModal())}
      />
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
