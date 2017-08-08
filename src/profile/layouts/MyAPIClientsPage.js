import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';
import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { ConfirmModalBody, DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import { DropdownCell, CheckboxCell, ThumbnailCell } from 'linode-components/tables/cells';
import { EmitEvent } from 'linode-components/utils';

import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import { clients as api } from '~/api';
import { resetSecret } from '~/api/clients';
import { transform } from '~/api/util';
import { API_ROOT } from '~/constants';

import { renderSecret } from '../components/CreatePersonalAccessToken';
import CreateOrEditApplication from '../components/CreateOrEditApplication';


const OBJECT_TYPE = 'clients';

export class MyAPIClientsPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.all());
  }

  constructor() {
    super();

    this.state = { filter: '' };
  }

  thumbnailSrc(client) {
    return `${API_ROOT}/account/clients/${client.id}/thumbnail`;
  }

  deleteAction = (client) => {
    const { dispatch } = this.props;

    return dispatch(showModal('Delete OAuth Client',
      <DeleteModalBody
        onSubmit={() => {
          dispatch(hideModal());
          return dispatch(api.delete(client.id));
        }}
        onCancel={() => dispatch(hideModal())}
        typeOfItem="Clients"
        items={[client.label]}
      />
    ));
  }

  resetAction = (client) => {
    const { dispatch } = this.props;
    const title = 'Reset Client Secret';

    return dispatch(showModal(title,
      <ConfirmModalBody
        onCancel={() => {
          EmitEvent('modal:cancel', 'Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        onSubmit={async () => {
          const { secret } = await dispatch(resetSecret(client.id));

          EmitEvent('modal:submit', 'Modal', 'reset', title);
          return dispatch(renderSecret(
            'client secret', 'reset', secret, () => dispatch(hideModal())));
        }}
      >
        Are you sure you want to reset <strong>{client.label}</strong>'s secret?
      </ConfirmModalBody>
    ));
  }

  createDropdownGroups = (client) => {
    const { dispatch } = this.props;
    const groups = [
      { elements: [{ name: 'Edit', action: () =>
        CreateOrEditApplication.trigger(dispatch, client) }] },
      { elements: [{ name: 'Reset Secret', action: () => this.resetAction(client) }] },
      { elements: [{ name: 'Delete', action: () => this.deleteAction(client) }] },
    ];
    return groups;
  }

  deleteClients = (clients) => {
    const { dispatch } = this.props;
    const clientsArr = Array.isArray(clients) ? clients : [clients];
    const title = 'Delete Client(s)';

    dispatch(showModal(title,
      <DeleteModalBody
        onSubmit={async () => {
          const ids = clientsArr.map(function (client) { return client.id; });

          await Promise.all(ids.map(id => dispatch(api.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          EmitEvent('modal:submit', 'Modal', 'delete', title);
          dispatch(hideModal());
        }}
        onCancel={() => {
          EmitEvent('modal:cancel', 'Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        items={clientsArr.map(n => n.label)}
        typeOfItem="Clients"
      />
    ));
  }

  clientLabel(client) {
    return client.client ? client.client.label : client.label;
  }

  renderClients = () => {
    const { dispatch, selectedMap, clients: { clients } } = this.props;
    const { filter } = this.state;

    const { sorted: sortedClients } = transform(clients, {
      filterBy: filter,
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedClients}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteClients },
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
          <Table
            columns={[
              { cellComponent: CheckboxCell, headerClassName: 'CheckboxColumn' },
              {
                cellComponent: ThumbnailCell,
                headerClassName: 'ThumbnailColumn',
                srcFn: this.thumbnailSrc,
              },
              {
                dataFn: this.clientLabel,
                tooltipEnabled: true,
                label: 'Label',
              },
              { dataKey: 'id', label: 'ID' },
              { dataKey: 'redirect_uri', label: 'Redirect URI' },
              {
                cellComponent: DropdownCell,
                headerClassName: 'DropdownColumn',
                groups: this.createDropdownGroups,
              },
            ]}
            noDataMessage="No clients found."
            data={sortedClients}
            selectedMap={selectedMap}
            onToggleSelect={(client) => dispatch(toggleSelected(OBJECT_TYPE, client.id))}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    const { dispatch } = this.props;

    return (
      <div>
        <header className="NavigationHeader clearfix">
          <PrimaryButton
            onClick={() => CreateOrEditApplication.trigger(dispatch)}
            className="float-right"
            buttonClass="btn-secondary"
          >Create an OAuth Client</PrimaryButton>
        </header>
        {this.renderClients()}
      </div>
    );
  }
}

MyAPIClientsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  clients: PropTypes.object.isRequired,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  return {
    clients: state.api.clients,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(MyAPIClientsPage);
