import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PrimaryButton from 'linode-components/dist/buttons/PrimaryButton';
import Input from 'linode-components/dist/forms/Input';
import List from 'linode-components/dist/lists/List';
import Table from 'linode-components/dist/tables/Table';
import MassEditControl from 'linode-components/dist/lists/controls/MassEditControl';
import ListHeader from 'linode-components/dist/lists/headers/ListHeader';
import ListBody from 'linode-components/dist/lists/bodies/ListBody';
import ListGroup from 'linode-components/dist/lists/bodies/ListGroup';
import ButtonCell from 'linode-components/dist/tables/cells/ButtonCell';
import CheckboxCell from 'linode-components/dist/tables/cells/CheckboxCell';
import LinkCell from 'linode-components/dist/tables/cells/LinkCell';

import { setAnalytics, setSource } from '~/actions';
import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import CreateHelper from '~/components/CreateHelper';
import PageControls from '~/components/PaginationControls';
import { confirmThenDelete } from '~/utilities';

import { AddMaster, AddSlave } from '../components';
import { Pagination } from '~/decorators/Pagination';
import { ComponentPreload as Preload } from '~/decorators/Preload';

const OBJECT_TYPE = 'domains';

export class DomainsList extends Component {
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
    'domain');

  formatStatus(s) {
    if (s === 'has_errors') {
      return 'Has Errors';
    }

    return capitalize(s);
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
      sortByFn: (zone) => zone.id,
    });

    return (
      <List>
        <ChainedDocumentTitle title="Domains" />
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedZones}
              dispatch={dispatch}
              massEditGroups={[{
                elements: [
                  { name: 'Delete', action: this.deleteDomains },
                ],
              }]}
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
          <PageControls {...this.props.pageControls} />
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
                    { dataKey: 'type', formatFn: capitalize },
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
          <PageControls {...this.props.pageControls} />
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch, email, page: domains } = this.props;

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
          {domains ?
            this.renderZones(domains) :
            <CreateHelper label="Domains" onClick={addMaster} linkText="Add a Domain" />}
        </div>
      </div>
    );
  }
}

DomainsList.propTypes = {
  dispatch: PropTypes.func,
  domains: PropTypes.object,
  page: PropTypes.array,
  pageControls: PropTypes.object,
  email: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  return {
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
    email: state.api.profile.email,
  };
}

const preloadRequest = async (dispatch) => {
  await dispatch(api.domains.page(0));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest),
  Pagination(api.domains, 'domains'),
)(DomainsList);
