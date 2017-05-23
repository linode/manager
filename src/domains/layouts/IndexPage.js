import _ from 'lodash';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import { DeleteModalBody } from 'linode-components/modals';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';

import { setError } from '~/actions/errors';
import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { domains } from '~/api';
import CreateHelper from '~/components/CreateHelper';


const OBJECT_TYPE = 'domains';

export class IndexPage extends Component {

  static async preload({ dispatch }) {
    try {
      await dispatch(domains.all());
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

    dispatch(setTitle('Domains'));
  }

  deleteZones(zonesToDelete) {
    const { dispatch } = this.props;
    const zonesArr = Array.isArray(zonesToDelete) ? zonesToDelete : [zonesToDelete];

    const selectedDomains = zonesArr.map(l => l.domain);

    dispatch(showModal('Delete Domain(s)',
      <DeleteModalBody
        onOk={async () => {
          const ids = zonesArr.map(function (zone) { return zone.id; });

          await dispatch(domains.delete(ids));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedDomains}
        typeOfItem="Domains"
        onCancel={() => dispatch(hideModal())}
      />
    ));
  }

  renderZones(zones) {
    const { dispatch, selectedMap } = this.props;
    // TODO: add sort function in dns zones config definition
    const sortedZones = _.sortBy(Object.values(zones), ({ created }) => moment(created));

    const groups = _.sortBy(
      _.map(_.groupBy(sortedZones, d => d.group), (_zones, _group) => {
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
                    { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
                    {
                      className: 'RowLabelCell',
                      cellComponent: LinkCell,
                      hrefFn: (zone) => `/domains/${zone.domain}`, textKey: 'domain',
                    },
                    { dataKey: 'type', formatFn: _.capitalize },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
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
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-sm-left">Domains</h1>
            <Link to="/domains/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a Domain
            </Link>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.domains.domains).length ?
            this.renderZones(this.props.domains.domains) :
            <CreateHelper label="Domains" href="/domains/create" linkText="Add a Domain" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  domains: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    domains: state.api.domains,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
