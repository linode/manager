import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { Table } from 'linode-components/tables';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ListBody, ListGroup } from 'linode-components/lists/bodies';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components/tables/cells';

import { setAnalytics, setSource } from '~/actions';
import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import CreateHelper from '~/components/CreateHelper';
import { confirmThenDelete } from '~/utilities';

import { AddMaster, AddSlave } from '../components';


const OBJECT_TYPE = 'domains';

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.domains.all());
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['domains']));
  }

  deleteDomains = confirmThenDelete(
    this.props.dispatch,
    'domain',
    api.domains.delete,
    OBJECT_TYPE,
    'domain').bind(this)

  formatStatus(s) {
    if (s === 'has_errors') {
      return 'Has Errors';
    }

    return _.capitalize(s);
  }

  /**
   * @todo For testing purposes, and due to the complexity,
   * this should probably be it's own component.
   */
  renderZones(zones) {
    const { dispatch, selectedMap } = this.props;
    const { filter } = this.state;

    const { groups, sorted: sortedZones } = transform(zones, {
      filterBy: filter,
      filterOn: 'domain',
    });

    return (
      <List>
        <ChainedDocumentTitle title="Domains" />
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedZones}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteDomains },
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
                    { dataKey: 'status', formatFn: this.formatStatus },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
                      text: 'Delete',
                      onClick: (domain) => { this.deleteDomains([domain]); },
                    },
                  ]}
                  noDataMessage="No domains found."
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
    const { dispatch, email } = this.props;

    const addMaster = () => AddMaster.trigger(dispatch, email);
    const addSlave = () => AddSlave.trigger(dispatch);

    const addOptions = [
      { name: 'Add a Slave Domain', action: addSlave },
    ];

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Domains</h1>
            <PrimaryButton onClick={addMaster} options={addOptions} className="float-right">
              Add a Domain
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.domains.domains).length ?
            this.renderZones(this.props.domains.domains) :
            <CreateHelper label="Domains" onClick={addMaster} linkText="Add a Domain" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  domains: PropTypes.object,
  email: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
};


function select(state) {
  return {
    domains: state.api.domains,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
    email: state.api.profile.email,
  };
}

export default connect(select)(IndexPage);
