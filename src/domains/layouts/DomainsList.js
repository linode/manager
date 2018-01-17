import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { DeleteModalBody } from 'linode-components';
import { PrimaryButton } from 'linode-components';
import { Input } from 'linode-components';
import { List } from 'linode-components';
import { Table } from 'linode-components';
import { MassEditControl } from 'linode-components';
import { ListHeader } from 'linode-components';
import { ListBody, ListGroup } from 'linode-components';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
} from 'linode-components';

import { removeSelected } from '~/actions/select';
import { dispatchOrStoreErrors } from '~/api/util';
import { setAnalytics, setSource } from '~/actions';
import { default as toggleSelected } from '~/actions/select';
import api from '~/api';
import { transform } from '~/api/util';
import { ChainedDocumentTitle } from '~/components';
import { PortalModal } from '~/components/modal';
import CreateHelper from '~/components/CreateHelper';

import { AddMaster, AddSlave } from '../components';
import { ComponentPreload as Preload } from '~/decorators/Preload';


const OBJECT_TYPE = 'domains';

export class DomainsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      modal: this.initModalState(),
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['domains']));
  }

  formatStatus(s) {
    if (s === 'has_errors') {
      return 'Has Errors';
    }

    return capitalize(s);
  }

  initModalState = () => ({
    name: null,
    title: '',
    items: [],
    onSubmit: () => null,
  });

  hideModal = () => this.setState({ modal: this.initModalState() });

  addMasterModal = () => this.setState({
    modal: {
      ...this.initModalState(),
      name: 'addMaster',
      title: AddMaster.title,
    },
  });

  addSlaveModal = () => this.setState({
    modal: {
      ...this.initModalState(),
      name: 'addSlave',
      title: AddSlave.title,
    },
  });

  deleteDomainsModal = (domains) => {
    const { dispatch } = this.props;
    const labels = domains.map(domain => domain.domain);
    const ids = domains.map(domain => domain.id);

    const callback = () => {
      dispatch(dispatchOrStoreErrors.call(this, [
        () => (dispatch) => Promise.all(ids.map(id => dispatch(api.domains.delete(id)))),
        () => removeSelected(OBJECT_TYPE, ids),
      ]));
      this.hideModal();
    };

    const plural = ids.length > 1 ? 's' : '';
    const title = `Delete Domain${plural}`;

    this.setState({
      modal: {
        ...this.initModalState(),
        name: 'massDeleteDomains',
        title: title,
        items: labels,
        onSubmit: callback,
      },
    });
  };

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
                { name: 'Delete', action: this.deleteDomainsModal },
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
                    { dataKey: 'type', formatFn: capitalize },
                    { dataKey: 'status', formatFn: this.formatStatus },
                    {
                      cellComponent: ButtonCell,
                      headerClassName: 'ButtonColumn',
                      text: 'Delete',
                      onClick: (domain) => { this.deleteDomainsModal([domain]); },
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

  renderModal = () => {
    const { dispatch, email } = this.props;
    const { name, title, items, onSubmit } = this.state.modal;
    if (!name) {
      return null;
    }
    return (
      <PortalModal
        title={title}
        onClose={this.hideModal}
      >
        {(name === 'addMaster') &&
          <AddMaster
            dispatch={dispatch}
            close={() => dispatch(this.hideModal())}
            email={email}
          />
        }
        {(name === 'addSlave') &&
          <AddSlave
            dispatch={dispatch}
            close={() => dispatch(this.hideModal())}
          />
        }
        {(name === 'massDeleteDomains') &&
          <DeleteModalBody
            onSubmit={onSubmit}
            items={items}
            typeOfItem="domains"
            onCancel={this.hideModal}
            deleteAction="delete"
            deleteActionPending="deleting"
          />
        }
      </PortalModal>
    );
  }

  render() {
    const addOptions = [
      { name: 'Add a Slave Domain', action: this.addSlaveModal },
    ];

    return (
      <div className="PrimaryPage container">
        {this.renderModal()}
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Domains</h1>
            <PrimaryButton
              onClick={this.addMasterModal} options={addOptions} className="float-right"
            >
              Add a Domain
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.domains.domains).length ?
            this.renderZones(this.props.domains.domains) :
            <CreateHelper label="Domains" onClick={this.addMasterModal} linkText="Add a Domain" />}
        </div>
      </div>
    );
  }
}

DomainsList.propTypes = {
  dispatch: PropTypes.func,
  domains: PropTypes.object,
  email: PropTypes.string,
  selectedMap: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  return {
    domains: state.api.domains,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
    email: state.api.profile.email,
  };
}

const preloadRequest = async (dispatch) => {
  await dispatch(api.domains.all());
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(DomainsList);
