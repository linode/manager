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

import { dnszones as api } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { default as toggleSelected } from '~/actions/select';
import CreateHelper from '~/components/CreateHelper';

const OBJECT_TYPE = 'dnszones';


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

    this.deleteZones = this.deleteZones.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('DNS Manager'));
  }

  deleteZones(zones) {
    const { dispatch, selectedMap, dnszones } = this.props;
    const zonesArr = Array.isArray(zones) ? zones : [zones];

    dispatch(showModal('Confirm deletion',
      <DeleteModalBody
        buttonText="Delete selected zones"
        onOk={async () => {
          const ids = zonesArr.map(function (zone) { return zone.id; });

          await dispatch(api.delete(ids));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={dnszones.dnszones}
        selectedItems={Object.keys(selectedMap)}
        typeOfItem="zones"
        label="dnszone"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderZones(zones) {
    const { dispatch, selectedMap } = this.props;
    // TODO: add sort function in dns zones config definition
    const sortedZones = _.sortBy(Object.values(zones), ({ created }) => moment(created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedZones, d => d.display_group), (_zones, _group) => {
        return {
          name: _group,
          data: _zones,
        };
      }), zoneGroup => zoneGroup.name);

    return (
      <List>
        <ListHeader>
          <div className="pull-sm-left">
            <MassEditControl
              data={sortedZones}
              dispatch={dispatch}
              massEditOptions={[
                { name: 'Delete', action: this.deleteZones },
              ]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
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
                      onClick: (zone) => { this.deleteZones(zone); },
                    },
                  ]}
                  data={group.data}
                  selectedMap={selectedMap}
                  disableHeader
                  onToggleSelect={(record) => {
                    dispatch(toggleSelected(OBJECT_TYPE, record.id));
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
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    dnszones: state.api.dnszones,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
