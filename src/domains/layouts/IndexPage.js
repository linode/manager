import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
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

import { setAnalytics, setSource, setTitle } from '~/actions';
import { showModal, hideModal } from '~/actions/modal';
import { default as toggleSelected } from '~/actions/select';
import { domains } from '~/api';
import { transform } from '~/api/util';
import CreateHelper from '~/components/CreateHelper';


const OBJECT_TYPE = 'domains';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(domains.all());
  }

  constructor(props) {
    super(props);

    this.deleteZones = this.deleteZones.bind(this);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Domains'));
    dispatch(setAnalytics(['domains']));
  }

  deleteZones(zonesToDelete) {
    const { dispatch } = this.props;
    const zonesArr = Array.isArray(zonesToDelete) ? zonesToDelete : [zonesToDelete];

    const selectedDomains = zonesArr.map(l => l.domain);

    dispatch(showModal('Delete Domain(s)', (
      <DeleteModalBody
        onSubmit={async () => {
          const ids = zonesArr.map(function (zone) { return zone.id; });

          await Promise.all(ids.map(id => dispatch(domains.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          dispatch(hideModal());
        }}
        items={selectedDomains}
        typeOfItem="Domains"
        onCancel={() => dispatch(hideModal())}
      />
    )));
  }

  renderZones(zones) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { groups, sorted: sortedZones } = transform(zones, {
      filterOn: 'domain',
      filterBy: filter,
      sortBy: d => d.domain.toLowerCase(),
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedZones}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteZones },
              ] }]}
              selectedMap={selectedMap}
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
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
                      cellComponent: LinkCell,
                      hrefFn: (zone) => `/domains/${zone.domain}`, textKey: 'domain',
                      tooltipEnabled: true,
                    },
                    { dataKey: 'type', formatFn: _.capitalize },
                    { dataKey: 'status', formatFn: _.capitalize },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
                      text: 'Delete',
                      onClick: (zone) => { this.deleteZones(zone); },
                    },
                  ]}
                  noDataMessage="No Domains found."
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
            <h1 className="float-left">Domains</h1>
            <PrimaryButton to="/domains/create" className="float-right">
              Add a Domain
            </PrimaryButton>
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
